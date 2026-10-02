const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Agency = sequelize.define("Agency", {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:    { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING },
  city:    { type: DataTypes.STRING },
  phone:   { type: DataTypes.STRING },
  status:  { type: DataTypes.ENUM("active","maintenance","closed"), defaultValue: "active" },
}, { timestamps: true });

module.exports = Agency;
