import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import hyundaiLogo from "../assets/hyundailogo.png";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Lien de vérification invalide ou incomplet.");
      return;
    }

    api.get(`/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.error || "La vérification a échoué.");
      });
  }, [token, email]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#141417] border border-white/10 rounded-2xl p-8 text-center">
        <img src={hyundaiLogo} alt="Hyundai" className="h-8 object-contain brightness-0 invert mx-auto mb-8" />
        
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-[#002C5F] border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Vérification en cours...</h2>
            <p className="text-gray-400 text-sm">Veuillez patienter pendant que nous validons votre compte.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-500 text-3xl mx-auto mb-4">
              ✅
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Compte activé !</h2>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <button onClick={() => navigate("/login")} className="w-full bg-[#002C5F] hover:bg-[#003875] text-white py-3 rounded-xl text-sm font-semibold transition-all">
              Se connecter
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 text-3xl mx-auto mb-4">
              ❌
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Vérification échouée</h2>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <button onClick={() => navigate("/login")} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-sm font-semibold transition-all">
              Retour à la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}
