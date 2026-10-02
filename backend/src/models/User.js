const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:       { type: DataTypes.STRING, allowNull: false },
  email:      { type: DataTypes.STRING, allowNull: false, unique: true },
  phone:      { type: DataTypes.STRING },
  password:   { type: DataTypes.STRING, allowNull: true },
  role:       { type: DataTypes.ENUM("USER","AGENT","ADMIN"), defaultValue: "USER" },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  photo:      { type: DataTypes.TEXT },
}, { timestamps: true });

module.exports = User;
