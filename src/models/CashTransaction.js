const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CashTransaction = sequelize.define('CashTransaction', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  period_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  verifier_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  amount_paid: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  fine_amount: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  payment_method: {
    type: DataTypes.ENUM('CASH', 'TRANSFER'),
    allowNull: false,
    defaultValue: 'CASH'
  },
  proof_image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('COMPLETE', 'REJECTED', 'PENDING'),
    allowNull: false,
    defaultValue: 'PENDING'
  }
}, {
  tableName: 'cash_transactions',
  timestamps: false,
  validate: {
    proofRequired() {
      if (this.payment_method === 'TRANSFER' && !this.proof_image_url) {
        throw new Error('Proof image URL is required for TRANSFER payments');
      }
    }
  }
});

CashTransaction.addHook('beforeSave', async (tx) => {
  const CashPeriod = sequelize.models.CashPeriod;
  if (!CashPeriod) return;
  if (tx.period_id && tx.payment_date) {
    const period = await CashPeriod.findByPk(tx.period_id);
    if (period && period.due_date) {
      const paid = new Date(tx.payment_date);
      const due = new Date(period.due_date);
      if (paid > due) {
        const daysLate = Math.floor((paid - due) / (1000 * 60 * 60 * 24));
        const fee = Number(period.late_fee_per_day || 0);
        tx.fine_amount = daysLate * fee;
      } else {
        tx.fine_amount = 0;
      }
    }
  }
});

module.exports = CashTransaction;