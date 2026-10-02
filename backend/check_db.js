const { User } = require("./src/models");

async function checkUsers() {
  try {
    const users = await User.findAll();
    console.log("--- LISTE DES UTILISATEURS DANS LA DB ---");
    users.forEach(u => {
      console.log(`- Nom: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (err) {
    console.error("Erreur lors de la lecture des utilisateurs:", err);
    process.exit(1);
  }
}

checkUsers();
