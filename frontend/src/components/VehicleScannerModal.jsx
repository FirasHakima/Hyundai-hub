import { useState, useRef } from "react";
import { userService, ocrService } from "../services/api";

export default function VehicleScannerModal({ onClose, onSaved }) {
  const [step, setStep] = useState(1); // 1: Recto, 2: Verso, 3: Result
  const [imageFront, setImageFront] = useState(null); // base64 for preview
  const [fileFront, setFileFront]   = useState(null);  // File for upload
  const [imageBack, setImageBack]   = useState(null);
  const [fileBack, setFileBack]     = useState(null);
  const [scanning, setScanning]     = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [saving, setSaving]         = useState(false);
  
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (step === 1) setFileFront(file);
    if (step === 2) setFileBack(file);

    const reader = new FileReader();
    reader.onload = ev => {
      if (step === 1) setImageFront(ev.target.result);
      if (step === 2) setImageBack(ev.target.result);
    };
    reader.readAsDataURL(file);
    setError("");
    e.target.value = null; // Reset input
  };

  const doScan = async () => {
    setStep(3);
    setScanning(true);
    setError("");
    setProgressMsg("Envoi des images à l'Intelligence Artificielle...");

    try {
      const formData = new FormData();
      formData.append("images", fileFront);
      if (fileBack) formData.append("images", fileBack);

      const res = await ocrService.scan(formData);
      
      if (res.data.success) {
        const d = res.data.data;
        
        // Smart Fuel Mapping (Arabic & French to ENUM)
        let mappedFuel = "petrol";
        const rawFuel = (d.energie || "").toLowerCase();
        if (rawFuel.includes("بنزين") || rawFuel.includes("essence") || rawFuel.includes("petrol")) {
          mappedFuel = "petrol";
        } else if (rawFuel.includes("مازوط") || rawFuel.includes("diesel") || rawFuel.includes("gazole") || rawFuel.includes("mazout")) {
          mappedFuel = "diesel";
        } else if (rawFuel.includes("hybride") || rawFuel.includes("hybrid")) {
          mappedFuel = "hybrid";
        } else if (rawFuel.includes("electrique") || rawFuel.includes("electric")) {
          mappedFuel = "electric";
        }

        setResult({
          plateNumber: d.numero_immatriculation || "",
          model:       `${d.marque || ""} ${d.modele || ""}`.trim(),
          year:        d.date_premiere_mise_en_circulation ? d.date_premiere_mise_en_circulation.split("/")[0] : 
                       d.date_validite ? d.date_validite.split("/")[0] : "",
          fuelType:    mappedFuel,
          color:       d.couleur || "Noir",
        });
      } else {
        throw new Error(res.data.message || "Extraction échouée");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "L'IA n'a pas pu lire cette carte. Veuillez saisir les informations manuellement.");
      setResult({ plateNumber: "", model: "", year: "", fuelType: "petrol", color: "Noir" });
    } finally {
      setScanning(false);
    }
  };

  const doSave = async () => {
    try {
      setSaving(true);
      const res = await userService.addVehicle(result);
      onSaved(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement du véhicule.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#141417] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">Scanner Intelligent AI</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? "bg-blue-500" : "bg-white/10"}`} />
              <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? "bg-blue-500" : "bg-white/10"}`} />
              <div className={`h-1.5 w-12 rounded-full ${step >= 3 ? "bg-green-500" : "bg-white/10"}`} />
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* STEP 1: RECTO */}
          {step === 1 && (
            <div className="animate-in fade-in zoom-in duration-300">
              <h3 className="text-white font-medium mb-1">Étape 1 : Recto de la carte</h3>
              <p className="text-xs text-gray-400 mb-4">La face avant contient la marque, le modèle et la plaque.</p>
              
              <div onClick={() => fileRef.current.click()} className="border-2 border-dashed border-white/10 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-white/5">
                {imageFront ? (
                  <img src={imageFront} alt="Recto" className="max-h-48 mx-auto rounded-xl object-contain mb-4 shadow-lg" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📷</div>
                    <p className="text-white text-sm font-medium mb-1">Cliquez pour ajouter le Recto</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setStep(3); setResult({ plateNumber: "", model: "", year: "", fuelType: "petrol", color: "Noir" }); }} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Saisir manuellement</button>
                <button onClick={() => setStep(2)} disabled={!imageFront} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all">
                  Continuer ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VERSO */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              <h3 className="text-white font-medium mb-1">Étape 2 : Verso de la carte (Optionnel)</h3>
              <p className="text-xs text-gray-400 mb-4">La face arrière permet de détecter le type d'énergie.</p>
              
              <div onClick={() => fileRef.current.click()} className="border-2 border-dashed border-white/10 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-white/5">
                {imageBack ? (
                  <img src={imageBack} alt="Verso" className="max-h-48 mx-auto rounded-xl object-contain mb-4 shadow-lg" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📸</div>
                    <p className="text-white text-sm font-medium mb-1">Cliquez pour ajouter le Verso</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">⬅ Retour</button>
                <button onClick={doScan} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all">
                  Analyser avec l'IA ✅
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RESULT / SCANNING */}
          {step === 3 && (
            <div className="animate-in fade-in zoom-in duration-300">
              {scanning ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
                  <h3 className="text-white font-medium text-lg mb-2">L'IA analyse votre carte...</h3>
                  <p className="text-sm text-blue-400">{progressMsg}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {error && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl border border-red-500/20">{error}</div>}
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full font-medium">✅ Analyse terminée</span>
                    <button onClick={() => { setStep(1); setImageFront(null); setImageBack(null); setResult(null); }} className="text-xs text-blue-400 hover:text-blue-300 underline">Recommencer</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Modèle</label>
                      <input value={result?.model || ""} onChange={e => setResult({...result, model: e.target.value})} placeholder="Ex: KIA PICANTO" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Matricule</label>
                      <input value={result?.plateNumber || ""} onChange={e => setResult({...result, plateNumber: e.target.value})} placeholder="Ex: 123 TUN 4567" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Année</label>
                      <input value={result?.year || ""} onChange={e => setResult({...result, year: e.target.value})} placeholder="Ex: 2023" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">Énergie</label>
                      <select value={result?.fuelType || "petrol"} onChange={e => setResult({...result, fuelType: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-colors [&>option]:bg-[#141417]">
                        <option value="petrol">Essence</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybrid">Hybride</option>
                        <option value="electric">Électrique</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/10">
                    <button onClick={doSave} disabled={saving || !result?.model || !result?.plateNumber} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:hover:bg-blue-600 flex justify-center items-center gap-2">
                      {saving ? "Sauvegarde en cours..." : "Confirmer et Enregistrer ➔"}
                    </button>
                    {(!result?.model || !result?.plateNumber) && <p className="text-center text-xs text-gray-500 mt-2">Veuillez vérifier les champs</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
