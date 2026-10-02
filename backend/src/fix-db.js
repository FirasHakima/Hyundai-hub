const sequelize = require("./config/database");
const { Vehicle } = require("./models");

async function fixDb() {
  try {
    console.log("Tentative de synchronisation forcée...");
    // Force: true va recréer la table. Attention: cela efface les véhicules de test actuels,
    // mais c'est la seule façon de débloquer une base de données corrompue sans psql.
    await Vehicle.sync({ force: true });
    console.log("Table Vehicles réinitialisée avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de la réparation :", error);
    process.exit(1);
  }
}

fixDb();
