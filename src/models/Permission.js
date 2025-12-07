const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT },
  module: { type: DataTypes.TEXT }
}, { tableName: 'permissions', timestamps: false });

module.exports = Permission;