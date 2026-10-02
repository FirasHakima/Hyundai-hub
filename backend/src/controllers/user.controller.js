const { User, Vehicle } = require("../models");
const bcrypt = require("bcryptjs");
const { createNotification } = require("./notification.controller");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, photo } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    await user.update({ 
      name: name || user.name, 
      phone: phone || user.phone,
      photo: photo || user.photo
    });
    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
    res.json({ message: "Profil mis à jour", user: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ where: { userId: req.user.id } });
    res.json(vehicles);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addVehicle = async (req, res) => {
  try {
    const { model, plateNumber, color, fuelType, year } = req.body;
    const vehicle = await Vehicle.create({
      userId: req.user.id,
      model,
      plateNumber,
      color: color || "Noir",
      fuelType,
      year: year ? parseInt(year) : null
    });
    await createNotification(req.user.id, "🚘 Nouveau véhicule", `Votre véhicule ${model} (${plateNumber}) a été ajouté avec succès.`, "vehicle", "/profile");
    res.status(201).json(vehicle);
  } catch (err) { 
    console.error("Add Vehicle Error:", err);
    res.status(500).json({ error: err.message }); 
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOne({ where: { id, userId: req.user.id } });
    if (!vehicle) return res.status(404).json({ error: "Véhicule introuvable ou accès refusé" });
    await vehicle.destroy();
    res.json({ message: "Véhicule supprimé avec succès" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
