const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:     { type: DataTypes.UUID, allowNull: false },
  vehicleId:  { type: DataTypes.UUID },
  serviceId:  { type: DataTypes.UUID, allowNull: false },
  agencyId:   { type: DataTypes.UUID, allowNull: false },
  agentId:    { type: DataTypes.UUID },
  date:       { type: DataTypes.DATEONLY, allowNull: false },
  timeSlot:   { type: DataTypes.STRING, allowNull: false },
  status:     { type: DataTypes.ENUM('pending','confirmed','rejected','done','cancelled'), defaultValue: 'pending' },
  notes:      { type: DataTypes.TEXT },
  totalPrice: { type: DataTypes.DECIMAL(10,2) },
}, { timestamps: true });

module.exports = Appointment;