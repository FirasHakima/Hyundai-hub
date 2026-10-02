const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const result = await genAI.listModels();
    console.log("Modèles disponibles :");
    result.models.forEach(m => console.log(`- ${m.name}`));
  } catch (error) {
    console.error("Erreur lors du listage :", error);
  }
}

listModels();
