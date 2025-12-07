const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.TEXT, allowNull: false, unique: true },
  name: { type: DataTypes.TEXT, allowNull: false },
  password: { type: DataTypes.TEXT, allowNull: false },
  position: { type: DataTypes.ENUM('P','VP','SEC','DIRECTOR','MANAGER','STAFF'), allowNull: false },
  division_id: { type: DataTypes.BIGINT, allowNull: true },
  sub_division_id: { type: DataTypes.BIGINT, allowNull: true }
}, { tableName: 'users', timestamps: false });

module.exports = User;