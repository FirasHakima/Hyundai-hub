const User         = require('./User');
const Vehicle      = require('./Vehicle');
const Agency       = require('./Agency');
const Service      = require('./Service');
const Appointment  = require('./Appointment');
const OTP          = require('./OTP');
const Notification = require('./Notification');

// Associations
User.hasMany(Vehicle,      { foreignKey: 'userId', as: 'vehicles' });
Vehicle.belongsTo(User,    { foreignKey: 'userId', as: 'owner' });

User.hasMany(Appointment,  { foreignKey: 'userId', as: 'appointments' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Appointment.belongsTo(User,    { foreignKey: 'userId',    as: 'client' });
Appointment.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Appointment.belongsTo(Agency,  { foreignKey: 'agencyId',  as: 'agency' });
Appointment.belongsTo(User,    { foreignKey: 'agentId',   as: 'agent' });

module.exports = { User, Vehicle, Agency, Service, Appointment, OTP, Notification };