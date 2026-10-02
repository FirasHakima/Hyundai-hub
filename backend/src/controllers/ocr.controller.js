const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const fs = require("fs");

exports.scanDocument = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images provided" });
    }

    const ocrKey = process.env.OCR_SPACE_API_KEY || "K87770582288957";
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return res.status(500).json({ success: false, message: "GEMINI_API_KEY is missing." });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    let extractedText = "";

    // 1. TRY OCR.SPACE FIRST
    try {
      console.log("Attempting OCR with OCR.space...");
      const file = req.files[0];
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      
      const formData = new URLSearchParams();
      formData.append("base64Image", base64Image);
      formData.append("apikey", ocrKey);
      formData.append("language", "fre"); // French is good for Tunisian docs
      formData.append("isOverlayRequired", "false");
      formData.append("OCREngine", "2"); // Engine 2 is often better for documents

      const ocrResponse = await axios.post("https://api.ocr.space/parse/image", formData);
      
      if (ocrResponse.data && ocrResponse.data.ParsedResults && ocrResponse.data.ParsedResults[0]) {
        extractedText = ocrResponse.data.ParsedResults[0].ParsedText;
        console.log("OCR.space successful extraction.");
      } else {
        throw new Error("OCR.space returned no results");
      }
    } catch (ocrErr) {
      console.warn("OCR.space failed, falling back to Gemini Vision:", ocrErr.message);
    }

    // 2. USE GEMINI TO STRUCTURE THE DATA (Perfect JSON)
    const modelsToTry = ["models/gemini-2.5-flash", "models/gemini-2.0-flash", "models/gemini-1.5-flash"];
    let structuredData = null;
    let structureError = "";

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    for (const modelName of modelsToTry) {
      try {
        console.log(`Structuring data with model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        let prompt = "";
        let aiInput = [];

        if (extractedText) {
          console.log("--- RAW OCR TEXT START ---");
          console.log(extractedText);
          console.log("--- RAW OCR TEXT END ---");

          prompt = `Tu es un expert en cartes grises tunisiennes. Voici le texte brut extrait d'une carte grise : 
          
          "${extractedText}"
          
          TA MISSION :
          Extraire les informations en JSON.
          
          CONSIGNES CRUCIALES POUR LE MATRICULE :
          - Le matricule tunisien est TOUJOURS au format : "CHIFFRES تونس CHIFFRES" (ex: 257 تونس 5128).
          - Il se trouve souvent en haut de la carte.
          - Même si les mots sont mal lus (ex: "J9" au lieu de "تونس"), cherche deux blocs de chiffres séparés par un mot.
          
          INFOS À EXTRAIRE :
          {
            "numero_immatriculation": "Le format exact 'XXX تونس YYYY'",
            "marque": "La marque (ex: KIA, HYUNDAI)",
            "modele": "Le modèle (ex: PICANTO, TUCSON)",
            "vin": "Le numéro de châssis (17 caractères)",
            "energie": "Essence ou Diesel ou Hybride ou Electrique",
            "date_premiere_mise_en_circulation": "YYYY/MM/DD",
            "date_validite": "YYYY/MM/DD"
          }
          
          Retourne UNIQUEMENT le JSON.`;
          aiInput = [prompt];
        } else {
          prompt = `Vision OCR - Carte Grise Tunisienne. Format Immatriculation: XXX تونس YYYY. JSON UNIQUEMENT.`;
          const imageParts = req.files.map(file => ({
            inlineData: { data: file.buffer.toString("base64"), mimeType: file.mimetype }
          }));
          aiInput = [prompt, ...imageParts];
        }

        const result = await model.generateContent(aiInput);
        const textResponse = await result.response.text();
        
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structuredData = JSON.parse(jsonMatch[0]);
          break; // Success!
        }
      } catch (err) {
        console.error(`Structure failed with ${modelName}:`, err.message);
        structureError += `${modelName}: ${err.message}\n`;
        
        if (err.message.includes("429")) {
          console.log("Quota hit, waiting 5s before trying next model...");
          await delay(5000);
        }
      }
    }

    if (!structuredData) throw new Error(`Failed to structure data after trying all models. Details:\n${structureError}`);

    res.json({ success: true, data: structuredData });

  } catch (error) {
    console.error("Global OCR Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error processing document" 
    });
  }
};
