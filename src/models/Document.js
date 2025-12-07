const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  uploader_id: { type: DataTypes.BIGINT, allowNull: false },
  title: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT },
  file_url: { type: DataTypes.TEXT, allowNull: false },
  access_level: { type: DataTypes.ENUM('EXECUTIVE','BOARD','PUBLIC'), allowNull: false },
  uploaded_at: { type: DataTypes.DATE }
}, { tableName: 'documents', timestamps: false });

module.exports = Document;