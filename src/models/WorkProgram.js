const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkProgram = sequelize.define('WorkProgram', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  division_id: { type: DataTypes.BIGINT, allowNull: false },
  name: { type: DataTypes.TEXT, allowNull: false },
  targets: { type: DataTypes.JSON },
  status: { type: DataTypes.TEXT, defaultValue: 'ACTIVE' }
}, { tableName: 'work_programs', timestamps: false });

module.exports = WorkProgram;