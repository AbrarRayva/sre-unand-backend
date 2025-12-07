const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.TEXT, allowNull: false },
  is_protected: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'roles', timestamps: false });

module.exports = Role;