const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OTP = sequelize.define('OTP', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email:     { type: DataTypes.STRING, allowNull: false },
  code:      { type: DataTypes.STRING(6), allowNull: false },
  purpose:   { type: DataTypes.ENUM('registration','login','appointment'), defaultValue: 'login' },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  used:      { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

module.exports = OTP;