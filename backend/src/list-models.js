require("dotenv").config();

async function listModelsFetch() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Liste des modèles autorisés :");
    if (data.models) {
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log("Aucun modèle trouvé. Réponse complète :", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

listModelsFetch();
