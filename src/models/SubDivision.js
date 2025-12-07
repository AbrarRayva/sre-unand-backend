const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubDivision = sequelize.define('SubDivision', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  division_id: { type: DataTypes.BIGINT, allowNull: false },
  name: { type: DataTypes.TEXT, allowNull: false }
}, { tableName: 'sub_divisions', timestamps: false });

module.exports = SubDivision;