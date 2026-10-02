import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import hyundaiLogo from "../assets/hyundailogo.png";
import heroBg from "../assets/hero.png";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", newPassword: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setStep(1); setOtp(""); setError(""); };
  const switchMode = (m) => { setMode(m); setStep(1); setError(""); setOtp(""); };

  // --- Register ---
  const doRegister = async () => {
    try {
      setLoading(true); setError("");
      if (!form.name || !form.email || !form.password) return setError("Tous les champs sont requis");
      
      // Validation du format d'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) return setError("Format d'email invalide (ex: exemple@mail.com)");
      
      await authService.register(form);
      setStep(2);
    } catch (err) { setError(err.response?.data?.error || "Erreur d'inscription"); }
    finally { setLoading(false); }
  };

  const doVerifyRegister = async () => {
    try {
      setLoading(true); setError("");
      const res = await authService.verifyOTP({ email: form.email, code: otp, type: "registration" });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) { setError(err.response?.data?.error || "Code invalide"); }
    finally { setLoading(false); }
  };

  // --- Login ---
  const doLogin = async () => {
    try {
      setLoading(true); setError("");
      if (!form.email || !form.password) return setError("Email et mot de passe requis");
      const res = await authService.login({ email: form.email, password: form.password });
      
      // Connexion directe avec le token et l'utilisateur reçus
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Identifiants incorrects";
      setError(msg);
    }
    finally { setLoading(false); }
  };

  const doVerifyLogin = async () => {
    try {
      setLoading(true); setError("");
      const res = await authService.verifyLogin({ email: form.email, code: otp });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) { setError(err.response?.data?.error || "Code invalide"); }
    finally { setLoading(false); }
  };

  // --- Forgot Password ---
  const doForgot = async () => {
    try {
      setLoading(true); setError("");
      await authService.forgotPassword({ email: form.email });
      setStep(2);
    } catch (err) { setError(err.response?.data?.error || "Email introuvable"); }
    finally { setLoading(false); }
  };

  const doReset = async () => {
    try {
      setLoading(true); setError("");
      if (form.newPassword !== form.confirmPassword) return setError("Les mots de passe ne correspondent pas");
      if (form.newPassword.length < 6) return setError("Minimum 6 caractères");
      await authService.resetPassword({ email: form.email, code: otp, newPassword: form.newPassword });
      setStep(3);
    } catch (err) { setError(err.response?.data?.error || "Échec de la réinitialisation"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex">

      {/* ── Left Panel: Hero ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#002C5F]/90 via-[#001a3a]/80 to-black/70" />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src={hyundaiLogo} alt="Hyundai" className="h-8 object-contain brightness-0 invert" />
        </div>

        {/* Bottom: Hero text */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/80 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Service Hyundai Premium
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Votre voiture mérite<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00aad2] to-[#00d4ff]">
              le meilleur service
            </span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Prenez rendez-vous, suivez vos entretiens et gérez vos véhicules en toute simplicité avec Hyundai Hub.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 mt-8">
            {[["4+", "Agences"], ["50+", "Services"], ["24/7", "Support"]].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="text-xs text-white/50 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={hyundaiLogo} alt="Hyundai" className="h-7 object-contain brightness-0 invert" />
          </div>

          {/* Tabs — only for login/register */}
          {(mode === "login" || mode === "register") && step === 1 && (
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-[#002C5F] text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
              >
                Connexion
              </button>
              <button
                onClick={() => switchMode("register")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "register" ? "bg-[#002C5F] text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
              >
                Inscription
              </button>
            </div>
          )}

          {/* Back button for forgot / OTP steps */}
          {(mode === "forgot" || step > 1) && step !== 3 && (
            <button
              onClick={() => step > 1 ? reset() : switchMode("login")}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Retour
            </button>
          )}

          {/* Error banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 flex items-center gap-2">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          {/* ─── LOGIN ─── */}
          {mode === "login" && (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Bon retour 👋</h2>
                    <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte Hyundai Hub</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                      <input name="email" type="email" placeholder="vous@email.com" value={form.email} onChange={handle}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#002C5F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Mot de passe</label>
                      <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle}
                        onKeyDown={e => e.key === "Enter" && doLogin()}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#002C5F] transition-all" />
                    </div>
                  </div>
                  <button onClick={() => switchMode("forgot")} className="text-xs text-[#00aad2] hover:text-[#00d4ff] transition-colors">
                    Mot de passe oublié ?
                  </button>
                  <button onClick={doLogin} disabled={loading}
                    className="w-full bg-[#002C5F] hover:bg-[#003875] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-all mt-2 flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connexion...</>
                    ) : "Se connecter"}
                  </button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Vérification 🔐</h2>
                    <p className="text-gray-500 text-sm mt-1">Code envoyé à <span className="text-white font-medium">{form.email}</span></p>
                  </div>
                  <div className="bg-[#002C5F]/10 border border-[#002C5F]/30 rounded-xl p-4 text-center">
                    <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000" maxLength={6}
                      className="w-full bg-transparent text-white text-center text-3xl tracking-[0.5em] font-mono placeholder-gray-700 focus:outline-none" />
                  </div>
                  <button onClick={doVerifyLogin} disabled={loading || otp.length !== 6}
                    className="w-full bg-[#002C5F] hover:bg-[#003875] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Vérification...</>
                    ) : "Confirmer la connexion"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─── REGISTER ─── */}
          {mode === "register" && (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Créer un compte</h2>
                    <p className="text-gray-500 text-sm mt-1">Rejoignez Hyundai Hub dès aujourd'hui</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    {[
                      { name: "name",     label: "Nom complet",           type: "text",     placeholder: "Votre nom" },
                      { name: "email",    label: "Email",                 type: "email",    placeholder: "vous@email.com" },
                      { name: "password", label: "Mot de passe (min. 6)", type: "password", placeholder: "••••••••" },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                        <input name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name]} onChange={handle}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#002C5F] transition-all" />
                      </div>
                    ))}
                  </div>
                  <button onClick={doRegister} disabled={loading}
                    className="w-full bg-[#002C5F] hover:bg-[#003875] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Inscription...</>
                    ) : "Créer mon compte"}
                  </button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Vérifiez votre email 📬</h2>
                    <p className="text-gray-500 text-sm mt-1">Code envoyé à <span className="text-white font-medium">{form.email}</span></p>
                  </div>
                  <div className="bg-[#002C5F]/10 border border-[#002C5F]/30 rounded-xl p-4 text-center">
                    <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000" maxLength={6}
                      className="w-full bg-transparent text-white text-center text-3xl tracking-[0.5em] font-mono placeholder-gray-700 focus:outline-none" />
                  </div>
                  <button onClick={doVerifyRegister} disabled={loading || otp.length !== 6}
                    className="w-full bg-[#002C5F] hover:bg-[#003875] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Vérification...</>
                    ) : "Confirmer le compte"}
                  </button>
                </div>
              )}
              {step === 3 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
                  <h2 className="text-xl font-semibold text-white mb-2">Compte créé !</h2>
                  <p className="text-gray-400 text-sm mb-6">Votre compte a été vérifié avec succès.</p>
                  <button onClick={() => switchMode("login")} className="w-full bg-[#002C5F] hover:bg-[#003875] text-white py-3 rounded-xl text-sm font-semibold transition-all">
                    Se connecter →
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─── FORGOT PASSWORD ─── */}
          {mode === "forgot" && (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Mot de passe oublié</h2>
                    <p className="text-gray-500 text-sm mt-1">Entrez votre email pour recevoir un code de réinitialisation.</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                    <input name="email" type="email" placeholder="vous@email.com" value={form.email} onChange={handle}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#002C5F] transition-all" />
                  </div>
                  <button onClick={doForgot} disabled={loading}
                    className="w-full bg-[#002C5F] hover:bg-[#003875] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...</>
                    ) : "Envoyer le code"}
                  </button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Nouveau mot de passe 🔑</h2>
                    <p className="text-gray-500 text-sm mt-1">Code envoyé à <span className="text-white font-medium">{form.email}</span></p>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-[#002C5F]/10 border border-[#002C5F]/30 rounded-xl p-4 text-center">
                      <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000" maxLength={6}
                        className="w-full bg-transparent text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-700 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Nouveau mot de passe</label>
                      <input name="newPassword" type="password" placeholder="••••••••" value={form.newPassword} onChange={handle}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#002C5F] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Confirmer</label>
                      <input name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handle}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#002C5F] transition-all" />
                    </div>
                  </div>
                  <button onClick={doReset} disabled={loading || otp.length !== 6}
                    className="w-full bg-[#002C5F] hover:bg-[#003875] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Réinitialisation...</>
                    ) : "Changer le mot de passe"}
                  </button>
                </div>
              )}
              {step === 3 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-[#002C5F]/20 border border-[#002C5F]/40 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">🔐</div>
                  <h2 className="text-xl font-semibold text-white mb-2">Mot de passe modifié !</h2>
                  <p className="text-gray-400 text-sm mb-6">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                  <button onClick={() => switchMode("login")} className="w-full bg-[#002C5F] hover:bg-[#003875] text-white py-3 rounded-xl text-sm font-semibold transition-all">
                    Se connecter →
                  </button>
                </div>
              )}
            </>
          )}

          {/* Footer note */}
          <p className="text-center text-gray-600 text-xs mt-8">
            © 2025 Hyundai Hub · Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}
