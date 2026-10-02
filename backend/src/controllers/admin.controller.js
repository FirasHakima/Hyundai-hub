const { User, Agency, Service, Appointment, Vehicle } = require('../models');

exports.stats = async (req, res) => {
  try {
    const [totalAppts, totalUsers, totalAgencies, totalVehicles] = await Promise.all([
      Appointment.count(),
      User.count({ where: { role: 'USER' } }),
      Agency.count(),
      Vehicle.count(),
    ]);
    res.json({ totalAppts, totalUsers, totalAgencies, totalVehicles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listUsers  = async (req, res) => res.json(await User.findAll({ attributes: { exclude: ['password'] } }));
exports.updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  await user.update(req.body);
  res.json(user);
};

exports.listAgencies  = async (req, res) => res.json(await Agency.findAll());
exports.createAgency  = async (req, res) => res.status(201).json(await Agency.create(req.body));
exports.updateAgency  = async (req, res) => {
  const a = await Agency.findByPk(req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json(await a.update(req.body));
};
exports.deleteAgency  = async (req, res) => {
  const a = await Agency.findByPk(req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  await a.destroy();
  res.json({ message: 'Deleted' });
};

exports.listServices  = async (req, res) => res.json(await Service.findAll());
exports.createService = async (req, res) => res.status(201).json(await Service.create(req.body));
exports.updateService = async (req, res) => {
  const s = await Service.findByPk(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(await s.update(req.body));
};
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    await user.destroy();
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Appointments Management ──────────────────────────────────────────────
exports.listAppointments = async (req, res) => {
  try {
    const appts = await Appointment.findAll({
      include: [
        { model: User, as: 'client', attributes: ['name', 'email'] },
        { model: Vehicle, as: 'vehicle' },
        { model: Service, as: 'service' },
        { model: Agency, as: 'agency' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(appts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    await appt.update(req.body);
    res.json(appt);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── Vehicles Management ──────────────────────────────────────────────────
exports.listVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }]
    });
    res.json(vehicles);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
