const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Division = sequelize.define('Division', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT }
}, { tableName: 'divisions', timestamps: false });

module.exports = Division;