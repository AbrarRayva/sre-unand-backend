const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CashPeriod = sequelize.define('CashPeriod', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  amount: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  late_fee_per_day: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'cash_periods',
  timestamps: false
});

module.exports = CashPeriod;