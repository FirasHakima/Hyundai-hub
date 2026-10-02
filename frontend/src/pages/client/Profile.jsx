import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/api";
import api from "../../services/api";
import hyundaiLogo from "../../assets/hyundailogo.png";
import VehicleScannerModal from "../../components/VehicleScannerModal";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [photo, setPhoto] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    userService.getProfile().then(res => {
      const u = res.data;
      setForm({ name: u.name || "", phone: u.phone || "" });
      if (u.photo) setPhoto(u.photo);
      updateUser(u);
    }).catch(() => {
      setForm({ name: user?.name || "", phone: user?.phone || "" });
    }).finally(() => setPageLoading(false));

    userService.getVehicles().then(res => setVehicles(res.data)).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const doSave = async () => {
    try {
      setLoading(true); setError(""); setSuccess("");
      const res = await userService.updateProfile({ name: form.name, phone: form.phone, photo });
      updateUser(res.data.user);
      setSuccess("Profil mis à jour avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la mise à jour");
    } finally { setLoading(false); }
  };

  const doDeleteAccount = async () => {
    try {
      setLoading(true);
      await api.delete("/auth/account");
      logout();
    } catch {
      setError("Erreur lors de la suppression du compte");
      setShowDeleteConfirm(false);
    } finally { setLoading(false); }
  };

  const doRequestEmailChange = async () => {
    try {
      setLoading(true); setError("");
      await api.post("/auth/change-email/request", { newEmail });
      setOtpStep(true);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l envoi du code");
    } finally { setLoading(false); }
  };

  const doConfirmEmailChange = async () => {
    try {
      setLoading(true); setError("");
      await api.post("/auth/change-email/confirm", { newEmail, code: otp });
      updateUser({ ...user, email: newEmail });
      setShowChangeEmail(false); setOtpStep(false); setOtp(""); setNewEmail("");
      setSuccess("Email mis à jour avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Code OTP invalide");
    } finally { setLoading(false); }
  };

  if (pageLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Chargement...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#002C5F] to-[#0057b8] rounded-2xl p-8 mb-6 overflow-hidden">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <img src={hyundaiLogo} alt="" className="h-24 object-contain" />
        </div>
        <div className="relative flex items-center gap-5">
          <div className="relative">
            <div
              onClick={() => fileRef.current.click()}
              className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
            >
              {photo ? <img src={photo} alt="Photo" className="w-full h-full object-cover" /> : initials}
            </div>
            <div onClick={() => fileRef.current.click()} className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg">
              <svg width="12" height="12" fill="none" stroke="#002C5F" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>
          <div>
            <div className="text-xl font-semibold text-white">{user?.name}</div>
            <div className="text-sm text-white/70 mt-1">{user?.email}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">{user?.role}</span>
              <span className="text-xs bg-green-500/30 text-green-300 px-3 py-1 rounded-full font-medium">Vérifié</span>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-3 rounded-xl mb-4 flex items-center gap-2">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Informations Personnelles</h2>
          <div className="bg-[#141417] border border-white/10 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Nom complet</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#002C5F] transition-all" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <div className="flex gap-2">
                <input value={user?.email} readOnly className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-gray-400 text-sm cursor-not-allowed" />
                <button onClick={() => { setShowChangeEmail(true); setError(""); }} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap">Changer</button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Téléphone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+216 55 123 456" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#002C5F] transition-all" />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">{error}</div>}
            <button onClick={doSave} disabled={loading} className="bg-[#002C5F] hover:bg-[#003875] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full">
              {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-sm font-semibold text-white mb-3">Zone Dangereuse</h2>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <div className="text-sm text-gray-300 mb-1 font-medium">Supprimer le compte</div>
              <div className="text-xs text-gray-500 mb-4">Supprime définitivement votre compte et toutes vos données. Cette action est irréversible.</div>
              <button onClick={() => setShowDeleteConfirm(true)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm font-medium transition-all">
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Mes Véhicules</h2>
          <div className="space-y-3">
            {vehicles.map((v, i) => (
              <div key={i} className="bg-[#141417] border border-white/10 rounded-xl p-4 flex gap-3 items-center">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2M5 17a2 2 0 104 0M5 17a2 2 0 114 0M15 17a2 2 0 104 0M15 17a2 2 0 114 0"/></svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{v.model}</div>
                  <div className="text-xs font-mono bg-white/10 text-gray-300 px-2 py-0.5 rounded inline-block mt-1">{v.plateNumber}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">{v.fuelType} · {v.color}</div>
                </div>
              </div>
            ))}
            {vehicles.length === 0 && <div className="text-sm text-gray-500 py-4 text-center">Aucun véhicule enregistré.</div>}
            <button onClick={() => setShowScanner(true)} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 border-dashed text-gray-400 hover:text-white px-4 py-3 rounded-xl text-sm transition-all">
              + Ajouter un véhicule
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#141417] border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Supprimer le compte ?</h3>
            <p className="text-gray-400 text-sm mb-6">Cette action supprimera définitivement votre compte et toutes vos données.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2.5 rounded-xl text-sm transition-all">Annuler</button>
              <button onClick={doDeleteAccount} disabled={loading} className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                {loading ? "Suppression..." : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showChangeEmail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#141417] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">{otpStep ? "Vérifier le nouvel email" : "Changer l email"}</h3>
            <p className="text-gray-400 text-sm mb-6">{otpStep ? `Entrez le code envoyé à ${newEmail}` : "Entrez votre nouvel email. Nous enverrons un code de vérification."}</p>
            {error && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl mb-4">{error}</div>}
            {!otpStep ? (
              <>
                <input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email" placeholder="nouveau@email.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#002C5F] transition-all mb-4" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowChangeEmail(false); setError(""); }} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2.5 rounded-xl text-sm transition-all">Annuler</button>
                  <button onClick={doRequestEmailChange} disabled={loading || !newEmail} className="flex-1 bg-[#002C5F] hover:bg-[#003875] text-white py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50">{loading ? "Envoi..." : "Envoyer le code"}</button>
                </div>
              </>
            ) : (
              <>
                <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="000000" maxLength={6} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-[#002C5F] transition-all mb-4" />
                <div className="flex gap-3">
                  <button onClick={() => { setOtpStep(false); setOtp(""); setError(""); }} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2.5 rounded-xl text-sm transition-all">Retour</button>
                  <button onClick={doConfirmEmailChange} disabled={loading || otp.length !== 6} className="flex-1 bg-[#002C5F] hover:bg-[#003875] text-white py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50">{loading ? "Vérification..." : "Confirmer"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Vehicle Scanner */}
      {showScanner && (
        <VehicleScannerModal 
          onClose={() => setShowScanner(false)} 
          onSaved={(newVehicle) => {
            setVehicles([...vehicles, newVehicle]);
            setShowScanner(false);
            setSuccess("Véhicule ajouté avec succès !");
            setTimeout(() => setSuccess(""), 3000);
          }} 
        />
      )}
    </div>
  );
}
