const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Article = sequelize.define('Article', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  author_id: { type: DataTypes.BIGINT, allowNull: false },
  editor_id: { type: DataTypes.BIGINT, allowNull: true },
  publish_date: { type: DataTypes.DATE },
  last_edit_date: { type: DataTypes.DATE },
  title: { type: DataTypes.TEXT, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('DRAFT','PUBLISHED','ARCHIVED'), allowNull: false, defaultValue: 'DRAFT' },
  image_url: { type: DataTypes.TEXT }
}, { tableName: 'articles', timestamps: false });

module.exports = Article;