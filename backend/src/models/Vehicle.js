const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false },
  model:       { type: DataTypes.STRING, allowNull: false },
  year:        { type: DataTypes.INTEGER },
  plateNumber: { type: DataTypes.STRING },
  color:       { type: DataTypes.STRING },
  fuelType:    { type: DataTypes.ENUM('petrol','diesel','electric','hybrid'), defaultValue: 'petrol' },
}, { timestamps: true });

module.exports = Vehicle;