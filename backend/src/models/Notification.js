const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:  { type: DataTypes.UUID, allowNull: false },
  title:   { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type:    { type: DataTypes.ENUM('appointment', 'vehicle', 'system'), defaultValue: 'system' },
  isRead:  { type: DataTypes.BOOLEAN, defaultValue: false },
  link:    { type: DataTypes.STRING },
}, { timestamps: true });

module.exports = Notification;
