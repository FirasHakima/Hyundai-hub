import { useState, useRef } from "react";

export default function CarteGrise() {
  const [image, setImage]       = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target.result);
    reader.readAsDataURL(file);
    setResult(null);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target.result);
    reader.readAsDataURL(file);
    setResult(null);
    setError("");
  };

  const doScan = async () => {
    if (!image) return;
    setScanning(true);
    setError("");
    setResult(null);

    try {
      const Tesseract = await import("tesseract.js");
      const { data: { text } } = await Tesseract.recognize(image, "fra+ara", {
        logger: () => {}
      });

      const extractField = (patterns, txt) => {
        for (const pattern of patterns) {
          const match = txt.match(pattern);
          if (match) return match[1]?.trim() || match[0]?.trim();
        }
        return null;
      };

      const matricule = extractField([
        /(\d{3}\s?TU\s?\d+)/i,
        /([0-9]{3}\s?[A-Z]{2}\s?[0-9]+)/,
        /matricule[:\s]+([^\n]+)/i,
      ], text);

      const chassis = extractField([
        /chassis[:\s]+([A-Z0-9]{17})/i,
        /VIN[:\s]+([A-Z0-9]{17})/i,
        /([A-Z]{2}[0-9A-Z]{15})/,
      ], text);

      const marque = extractField([
        /marque[:\s]+([^\n]+)/i,
        /(HYUNDAI|TOYOTA|RENAULT|PEUGEOT|VOLKSWAGEN|BMW|MERCEDES|KIA|SEAT|FORD|HONDA|NISSAN)/i,
      ], text);

      const modele = extractField([
        /modele[:\s]+([^\n]+)/i,
        /type[:\s]+([^\n]+)/i,
        /(TUCSON|ELANTRA|SONATA|KONA|SANTA FE|i10|i20|i30|CRETA|IONIQ)/i,
      ], text);

      const annee = extractField([
        /annee[:\s]+(\d{4})/i,
        /(\b20[0-2][0-9]\b)/,
        /(\b19[8-9][0-9]\b)/,
      ], text);

      const carburant = extractField([
        /carburant[:\s]+([^\n]+)/i,
        /energie[:\s]+([^\n]+)/i,
        /(DIESEL|ESSENCE|HYBRIDE|ELECTRIQUE|GPL)/i,
      ], text);

      const puissance = extractField([
        /puissance[:\s]+(\d+)/i,
        /(\d+)\s*CV/i,
        /(\d+)\s*ch/i,
      ], text);

      const proprietaire = extractField([
        /proprietaire[:\s]+([^\n]+)/i,
        /titulaire[:\s]+([^\n]+)/i,
        /nom[:\s]+([^\n]+)/i,
      ], text);

      setResult({
        matricule:     matricule     || "Non detecte",
        chassis:       chassis       || "Non detecte",
        marque:        marque        || "Non detecte",
        modele:        modele        || "Non detecte",
        annee:         annee         || "Non detecte",
        carburant:     carburant     || "Non detecte",
        puissance:     puissance     || "Non detecte",
        proprietaire:  proprietaire  || "Non detecte",
        rawText:       text,
      });
    } catch {
      setError("Erreur lors de la lecture. Verifiez que l image est claire.");
    } finally {
      setScanning(false);
    }
  };

  const fields = result ? [
    { label: "Matricule",     value: result.matricule,    icon: "🔢" },
    { label: "Num. Chassis",  value: result.chassis,      icon: "⚙️" },
    { label: "Marque",        value: result.marque,       icon: "🚘" },
    { label: "Modele",        value: result.modele,       icon: "🚙" },
    { label: "Annee",         value: result.annee,        icon: "📅" },
    { label: "Carburant",     value: result.carburant,    icon: "⛽" },
    { label: "Puissance",     value: result.puissance,    icon: "⚡" },
    { label: "Proprietaire",  value: result.proprietaire, icon: "👤" },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Scanner la Carte Grise</h1>
        <p className="text-gray-400 text-sm mt-1">Importez une photo de votre carte grise pour extraire automatiquement les informations</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Upload */}
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-white/10 hover:border-[#002C5F] rounded-2xl p-8 text-center cursor-pointer transition-all mb-4 bg-white/5 hover:bg-white/[0.07]"
          >
            {image ? (
              <img src={image} alt="Carte grise" className="max-h-64 mx-auto rounded-xl object-contain" />
            ) : (
              <div>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-400">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                </div>
                <p className="text-white text-sm font-medium mb-1">Glissez votre carte grise ici</p>
                <p className="text-gray-500 text-xs">ou cliquez pour choisir un fichier</p>
                <p className="text-gray-600 text-xs mt-2">JPG, PNG, PDF - Max 10MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>

          {image && (
            <div className="flex gap-3">
              <button onClick={() => { setImage(null); setResult(null); setError(""); }}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-3 rounded-xl text-sm transition-all">
                Changer l image
              </button>
              <button onClick={doScan} disabled={scanning}
                className="flex-1 bg-[#002C5F] hover:bg-[#003875] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
                {scanning ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Scan en cours...</>
                ) : (
                  <><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 4h4V2H3a2 2 0 00-2 2v4h2V4zM17 2v2h4v4h2V4a2 2 0 00-2-2h-4zM3 16H1v4a2 2 0 002 2h4v-2H3v-4zM21 16v4h-4v2h4a2 2 0 002-2v-4h-2z"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>Scanner la carte grise</>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mt-4">{error}</div>
          )}

          {scanning && (
            <div className="mt-4 bg-[#141417] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <svg className="animate-spin w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <span className="text-sm text-gray-300">Analyse OCR en cours...</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#002C5F] rounded-full animate-pulse" style={{width:"60%"}} />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {!result && !scanning && (
            <div className="bg-[#141417] border border-white/10 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-600">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Les informations extraites apparaitront ici</p>
              <p className="text-gray-600 text-xs mt-2">Importez une image et cliquez sur Scanner</p>
            </div>
          )}

          {result && (
            <div className="bg-[#141417] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Informations extraites</h2>
                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">OCR reussi</span>
              </div>
              <div className="space-y-3">
                {fields.map((f,i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-lg">{f.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{f.label}</div>
                      <div className={`text-sm font-medium truncate ${f.value === "Non detecte" ? "text-gray-600 italic" : "text-white"}`}>
                        {f.value}
                      </div>
                    </div>
                    {f.value !== "Non detecte" && (
                      <button onClick={() => navigator.clipboard.writeText(f.value)}
                        className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    const url = new URL(window.location.origin + "/book");
                    if (result.marque !== "Non detecte") url.searchParams.set("marque", result.marque);
                    if (result.modele !== "Non detecte") url.searchParams.set("modele", result.modele);
                    window.location.href = url.toString();
                  }}
                  className="w-full bg-[#002C5F] hover:bg-[#003875] text-white py-3 rounded-xl text-sm font-medium transition-all"
                >
                  Utiliser ces informations pour reserver un RDV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg width="16" height="16" fill="none" stroke="#60a5fa" strokeWidth="1.5" viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <div>
            <p className="text-xs text-blue-300 font-medium mb-1">Comment obtenir un meilleur resultat</p>
            <ul className="text-xs text-gray-400 space-y-0.5">
              <li>Prenez la photo dans un endroit bien eclaire</li>
              <li>Assurez-vous que le document est bien a plat et net</li>
              <li>Evitez les reflets et les ombres sur le document</li>
              <li>La carte grise doit etre entierement visible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
