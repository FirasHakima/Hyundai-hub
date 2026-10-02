const fs = require("fs");
require("dotenv").config();

async function testDirectFetch() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: "Hello, identify yourself." }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Statut HTTP:", response.status);
    console.log("Réponse API:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Erreur Fetch:", error);
  }
}

testDirectFetch();
