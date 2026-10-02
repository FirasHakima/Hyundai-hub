const sequelize = require("./config/database");
require("./models"); // Load associations

async function fixAllDb() {
  try {
    console.log("Synchronisation globale en cours...");
    await sequelize.sync({ force: true });
    console.log("Toutes les tables ont été réinitialisées proprement !");
    process.exit(0);
  } catch (error) {
    console.error("Erreur :", error);
    process.exit(1);
  }
}

fixAllDb();
