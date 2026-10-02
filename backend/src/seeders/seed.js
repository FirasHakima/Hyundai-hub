require("dotenv").config();
const { Agency, Service } = require("../models");
const sequelize = require("../config/database");

const seed = async () => {
  await sequelize.sync({ alter: true });

  await Agency.destroy({ where: {} });
  await Service.destroy({ where: {} });

  const agencies = await Agency.bulkCreate([
    { name: "Hyundai Tunis Centre",  address: "Avenue Habib Bourguiba", city: "Tunis",    phone: "+216 71 000 001", status: "active" },
    { name: "Hyundai La Marsa",      address: "Route de la Corniche",   city: "La Marsa", phone: "+216 71 000 002", status: "active" },
    { name: "Hyundai Sfax",          address: "Route de Gabes",         city: "Sfax",     phone: "+216 74 000 003", status: "active" },
    { name: "Hyundai Sousse",        address: "Boulevard du Maghreb",   city: "Sousse",   phone: "+216 73 000 004", status: "active" },
  ]);

  const services = await Service.bulkCreate([
    { name: "Vidange huile",          description: "Vidange huile synthetique complete", duration: 45,  price: 85,  category: "maintenance", isActive: true },
    { name: "Inspection complete",    description: "Controle 60 points du vehicule",     duration: 90,  price: 120, category: "maintenance", isActive: true },
    { name: "Service freins",         description: "Plaquettes, disques et liquide",     duration: 120, price: 180, category: "repair",      isActive: true },
    { name: "Service climatisation",  description: "Controle, recharge et filtre",       duration: 60,  price: 95,  category: "maintenance", isActive: true },
    { name: "Essai routier",          description: "Essai des nouveaux modeles",         duration: 30,  price: 0,   category: "test_drive",  isActive: true },
    { name: "Reparation moteur",      description: "Diagnostic et reparation moteur",    duration: 240, price: 300, category: "repair",      isActive: true },
  ]);

  console.log("Agences creees:");
  agencies.forEach(a => console.log(" -", a.id, a.name));
  console.log("Services crees:");
  services.forEach(s => console.log(" -", s.id, s.name));
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
