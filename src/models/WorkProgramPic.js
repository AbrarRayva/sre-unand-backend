const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkProgramPic = sequelize.define('WorkProgramPic', {
  work_programs_id: { type: DataTypes.BIGINT, allowNull: false },
  user_id: { type: DataTypes.BIGINT, allowNull: false }
}, { tableName: 'work_program_pics', timestamps: false });

module.exports = WorkProgramPic;