const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Service = sequelize.define("Service", {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  duration:    { type: DataTypes.INTEGER },
  price:       { type: DataTypes.DECIMAL(10,2) },
  category:    { type: DataTypes.ENUM("maintenance","repair","test_drive"), defaultValue: "maintenance" },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

module.exports = Service;
