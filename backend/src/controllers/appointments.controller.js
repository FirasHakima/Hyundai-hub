const { Appointment, Service, Agency, Vehicle, User } = require("../models");
const { createOTP, verifyOTP } = require("../utils/otp");
const { createNotification } = require("./notification.controller");

exports.list = async (req, res) => {
  try {
    const where = req.user.role === "USER" ? { userId: req.user.id } : {};
    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: Service, as: "service", attributes: ["name","price","duration"] },
        { model: Agency,  as: "agency",  attributes: ["name","city"] },
        { model: Vehicle, as: "vehicle", attributes: ["model","plateNumber"] },
        { model: User,    as: "client",  attributes: ["name","email","phone"] },
      ],
      order: [["date","DESC"],["timeSlot","ASC"]],
    });
    res.json(appointments);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { serviceId, agencyId, vehicleId, date, timeSlot, notes } = req.body;
    if (!serviceId || !agencyId || !date || !timeSlot) {
      return res.status(400).json({ error: "Service, agency, date and time are required" });
    }
    const appt = await Appointment.create({
      userId: req.user.id,
      serviceId: String(serviceId),
      agencyId: String(agencyId),
      vehicleId: vehicleId ? String(vehicleId) : null,
      date,
      timeSlot,
      notes,
      status: "pending"
    });
    const code = await createOTP(req.user.email, "appointment");
    res.status(201).json({ message: "OTP envoyé pour confirmer la réservation", appointmentId: appt.id, otp: code });
  } catch (err) { 
    console.error("Create Appointment Error:", err);
    res.status(500).json({ error: err.message }); 
  }
};

exports.listServices = async (req, res) => {
  try {
    const services = await Service.findAll({ where: { isActive: true } });
    res.json(services);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.listAgencies = async (req, res) => {
  try {
    const agencies = await Agency.findAll({ where: { status: "active" } });
    res.json(agencies);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.confirmWithOTP = async (req, res) => {
  try {
    const { code } = req.body;
    const result = await verifyOTP(req.user.email, code, "appointment");
    if (!result.valid) return res.status(400).json({ error: result.reason });
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt || appt.userId !== req.user.id) return res.status(404).json({ error: "Introuvable" });
    await appt.update({ status: "confirmed" });
    await createNotification(appt.userId, "✅ Rendez-vous confirmé", `Votre rendez-vous du ${appt.date} à ${appt.timeSlot} a été confirmé.`, "appointment", "/appointments");
    res.json({ message: "Rendez-vous confirmé", appointment: appt });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ error: "Introuvable" });
    const prevStatus = appt.status;
    await appt.update({ status, agentId: req.user.id });

    // Notify the client about their appointment status
    const labels = {
      confirmed: { title: "✅ Rendez-vous confirmé",   msg: `Votre rendez-vous du ${appt.date} à ${appt.timeSlot} a été confirmé par notre équipe.` },
      rejected:  { title: "❌ Rendez-vous refusé",    msg: `Votre rendez-vous du ${appt.date} à ${appt.timeSlot} a été refusé. Veuillez en créer un autre.` },
      done:      { title: "🏁 Service terminé",        msg: `Le service de votre véhicule du ${appt.date} est terminé. Merci de votre confiance !` },
      cancelled: { title: "🚫 Rendez-vous annulé",    msg: `Votre rendez-vous du ${appt.date} à ${appt.timeSlot} a été annulé.` },
    };
    if (labels[status] && prevStatus !== status) {
      await createNotification(appt.userId, labels[status].title, labels[status].msg, "appointment", "/appointments");
    }
    res.json(appt);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.cancel = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt || appt.userId !== req.user.id) return res.status(404).json({ error: "Introuvable" });
    if (!["pending","confirmed"].includes(appt.status))
      return res.status(400).json({ error: "Impossible d annuler ce rendez-vous" });
    await appt.update({ status: "cancelled" });
    await createNotification(appt.userId, "🚫 Rendez-vous annulé", `Votre rendez-vous du ${appt.date} à ${appt.timeSlot} a été annulé.`, "appointment", "/appointments");
    res.json({ message: "Annulé" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
