import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentService, userService } from "../../services/api";
import VehicleScannerModal from "../../components/VehicleScannerModal";

const serviceIcons = {
  "Vidange huile": "🛢️",
  "Inspection complete": "🔍",
  "Service freins": "🛑",
  "Service climatisation": "❄️",
  "Essai routier": "🚘",
  "Reparation moteur": "🔧",
};

const agencyIcons = {
  "Hyundai Tunis Centre": "🏢",
  "Hyundai La Marsa": "🏬",
  "Hyundai Sfax": "🏭",
  "Hyundai Sousse": "🏦",
};

const allSlots  = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00"];
const fullSlots = ["09:00","10:30","15:00"];
const availDays = [3,5,6,8,10,12,13,15,17,19,20,22,24,26];
const months    = ["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"];

export default function Book() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [selected, setSelected] = useState({ vehicle: null, service: null, agency: null, date: null, time: null });
  const [notes, setNotes]       = useState("");
  const [otp, setOtp]           = useState("");
  const [appointmentId, setAppointmentId] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [calMonth, setCalMonth] = useState(4);
  const [calYear]   = useState(2025);
  const [services, setServices] = useState([]);
  const [agencies, setAgencies] = useState([]);

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const fetchVehicles = () => {
    userService.getVehicles().then(res => setVehicles(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchVehicles();
    appointmentService.getServices().then(res => setServices(res.data)).catch(console.error);
    appointmentService.getAgencies().then(res => setAgencies(res.data)).catch(console.error);
  }, []);

  const doDeleteVehicle = async (e, id) => {
    e.stopPropagation(); // Pour éviter de sélectionner le véhicule en cliquant sur supprimer
    if (window.confirm("Voulez-vous vraiment supprimer ce véhicule ?")) {
      try {
        await userService.deleteVehicle(id);
        fetchVehicles();
        if (selected.vehicle?.id === id) setSelected({ ...selected, vehicle: null });
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const stepLabels = ["Véhicule", "Service", "Agence et Horaire", "Confirmation"];

  const doCreate = async () => {
    try {
      setLoading(true); setError("");
      const dateStr = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(selected.date).padStart(2,"0")}`;
      const res = await appointmentService.create({
        vehicleId: selected.vehicle.id,
        serviceId: selected.service.id,
        agencyId:  selected.agency.id,
        date:      dateStr,
        timeSlot:  selected.time,
        notes,
      });
      setAppointmentId(res.data.appointmentId);
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la creation du rendez-vous");
    } finally { setLoading(false); }
  };

  const doConfirmOTP = async () => {
    try {
      setLoading(true); setError("");
      await appointmentService.confirmOTP(appointmentId, otp);
      navigate("/appointments");
    } catch (err) {
      setError(err.response?.data?.error || "Code OTP invalide");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Prendre un Rendez-vous</h1>
        <p className="text-gray-400 text-sm mt-1">Reservez votre service Hyundai en 3 etapes simples</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                step > i+1 ? "bg-green-500 border-green-500 text-white" :
                step === i+1 ? "border-blue-500 text-blue-400 bg-blue-500/10" :
                "border-white/20 text-gray-500"
              }`}>
                {step > i+1 ? "?" : i+1}
              </div>
              <span className={`text-sm font-medium ${step === i+1 ? "text-white" : "text-gray-500"}`}>{label}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-px mx-4 ${step > i+1 ? "bg-green-500" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 — Vehicle */}
      {step === 1 && (
        <div className="bg-[#141417] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Sélectionnez ou ajoutez un véhicule</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {vehicles.map(v => (
              <div key={v.id} onClick={() => setSelected({...selected, vehicle: v})}
                className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4 ${
                  selected.vehicle?.id === v.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}>
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-xl">🚘</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{v.model}</div>
                  <div className="text-xs font-mono bg-white/10 text-gray-300 px-2 py-0.5 rounded inline-block mt-1">{v.plateNumber}</div>
                </div>
                <button onClick={(e) => doDeleteVehicle(e, v.id)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <div onClick={() => setShowScanner(true)}
              className="border border-white/10 border-dashed bg-white/5 hover:bg-white/10 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center">
              <span className="text-2xl mb-2">📸</span>
              <span className="text-sm font-medium text-white">Ajouter un véhicule</span>
              <span className="text-xs text-gray-400 mt-1">Scanner la Carte Grise</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => selected.vehicle && setStep(2)} disabled={!selected.vehicle}
              className="bg-[#002C5F] hover:bg-[#003875] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">
              Suivant : Choisir le service
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Service */}
      {step === 2 && (
        <div className="bg-[#141417] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Choisissez un service</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {services.map(s => (
              <div key={s.id} onClick={() => setSelected({...selected, service: s})}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  selected.service?.id === s.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}>
                <div className="text-2xl mb-2">{serviceIcons[s.name] || "🛠️"}</div>
                <div className="text-sm font-semibold text-white mb-1">{s.name}</div>
                <div className="text-xs text-gray-400 mb-2">{s.description}</div>
                <div className="text-xs text-cyan-400 font-semibold">{s.price} TND</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-5 py-2.5 rounded-xl text-sm transition-all">Retour</button>
            <button onClick={() => selected.service && setStep(3)} disabled={!selected.service}
              className="bg-[#002C5F] hover:bg-[#003875] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">
              Suivant : Choisir l agence
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Agency & Time */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-[#141417] border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Choisissez une agence</h2>
            <div className="grid grid-cols-2 gap-3">
              {agencies.map(a => (
                <div key={a.id} onClick={() => setSelected({...selected, agency: a})}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selected.agency?.id === a.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}>
                  <div className="text-sm font-medium text-white mb-1">{a.name}</div>
                  <div className="text-xs text-gray-400">{a.address}</div>
                  <div className="text-xs text-cyan-400 mt-1">{a.city}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#141417] border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Choisissez la date et l heure</h2>
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCalMonth(m => m===0?11:m-1)} className="w-7 h-7 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all text-sm">&#8249;</button>
                <span className="text-sm font-semibold text-white">{months[calMonth]} {calYear}</span>
                <button onClick={() => setCalMonth(m => m===11?0:m+1)} className="w-7 h-7 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all text-sm">&#8250;</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Di","Lu","Ma","Me","Je","Ve","Sa"].map(d => (
                  <div key={d} className="text-center text-xs text-gray-500 font-semibold py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array(firstDay).fill(null).map((_,i) => <div key={i} />)}
                {Array(daysInMonth).fill(null).map((_,i) => {
                  const day = i+1;
                  const isAvail = availDays.includes(day);
                  const isSel = selected.date === day;
                  return (
                    <div key={day} onClick={() => isAvail && setSelected({...selected, date: day})}
                      className={`text-center py-2 rounded-lg text-xs transition-all ${
                        isSel ? "bg-[#002C5F] text-white" :
                        isAvail ? "text-gray-300 hover:bg-white/10 cursor-pointer" :
                        "text-gray-600 cursor-not-allowed"
                      }`}>{day}</div>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-3">Creneaux disponibles :</div>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {allSlots.map(t => {
                const isFull = fullSlots.includes(t);
                const isSel  = selected.time === t;
                return (
                  <div key={t} onClick={() => !isFull && setSelected({...selected, time: t})}
                    className={`text-center py-2 rounded-lg text-xs border transition-all ${
                      isSel ? "bg-[#002C5F] border-[#002C5F] text-white" :
                      isFull ? "border-white/5 text-gray-600 line-through cursor-not-allowed" :
                      "border-white/10 text-gray-300 hover:border-white/20 cursor-pointer"
                    }`}>{t}</div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-5 py-2.5 rounded-xl text-sm transition-all">Retour</button>
              <button onClick={() => selected.agency && selected.date && selected.time && setStep(4)}
                disabled={!selected.agency || !selected.date || !selected.time}
                className="bg-[#002C5F] hover:bg-[#003875] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">
                Suivant : Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — Confirm */}
      {step === 4 && (
        <div className="bg-[#141417] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Confirmer le rendez-vous</h2>
          <div className="bg-white/5 rounded-xl p-5 mb-5 grid grid-cols-2 gap-4">
            {[
              ["Service",       selected.service?.name],
              ["Agence",        selected.agency?.name],
              ["Date et heure", `${months[calMonth]} ${selected.date}, ${calYear} - ${selected.time}`],
              ["Vehicule",      selected.vehicle?.model || "Non spécifié"],
              ["Duree",         `~${selected.service?.duration} min`],
                             ["Cout estimé",   `${selected.service?.price} TND`],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
                <div className="text-sm font-medium text-white">{val}</div>
              </div>
            ))}
          </div>
          <textarea placeholder="Notes supplementaires (optionnel)..." value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#002C5F] resize-none mb-4" />
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-gray-300 mb-5">
            Un code OTP sera envoye a votre email pour confirmer cette reservation.
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4">{error}</div>}
          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-5 py-2.5 rounded-xl text-sm transition-all">Retour</button>
            <button onClick={doCreate} disabled={loading}
              className="bg-[#002C5F] hover:bg-[#003875] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">
              {loading ? "Traitement..." : "Confirmer et envoyer le code OTP"}
            </button>
          </div>
        </div>
      )}

      {/* Step 5 — OTP */}
      {step === 5 && (
        <div className="bg-[#141417] border border-white/10 rounded-xl p-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#002C5F]/20 border border-[#002C5F]/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" fill="none" stroke="#00aad2" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Verifiez votre email</h2>
          <p className="text-gray-400 text-sm mb-6">Entrez le code a 6 chiffres envoye a votre email</p>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4">{error}</div>}
          <input placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} maxLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest font-mono placeholder-gray-600 focus:outline-none focus:border-[#002C5F] mb-4" />
          <button onClick={doConfirmOTP} disabled={loading || otp.length !== 6}
            className="w-full bg-[#002C5F] hover:bg-[#003875] disabled:opacity-40 text-white py-3 rounded-xl text-sm font-medium transition-all">
            {loading ? "Verification..." : "Confirmer le rendez-vous"}
          </button>
        </div>
      )}
      {showScanner && (
        <VehicleScannerModal 
          onClose={() => setShowScanner(false)} 
          onSaved={(newVehicle) => {
            setVehicles([...vehicles, newVehicle]);
            setSelected({...selected, vehicle: newVehicle});
            setShowScanner(false);
          }} 
        />
      )}
    </div>
  );
}
