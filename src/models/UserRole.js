const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserRole = sequelize.define('UserRole', {
  user_id: { type: DataTypes.BIGINT, allowNull: false },
  role_id: { type: DataTypes.BIGINT, allowNull: false }
}, { tableName: 'user_roles', timestamps: false });

module.exports = UserRole;