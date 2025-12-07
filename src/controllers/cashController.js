const { CashPeriod, CashTransaction, User } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHelper');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Calculate late fee based on due date
const calculateLateFee = (dueDate, paymentDate, lateFeePerDay) => {
  const due = new Date(dueDate);
  const payment = new Date(paymentDate);
  
  if (payment <= due) return 0;
  
  const diffTime = Math.abs(payment - due);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays * lateFeePerDay;
};

// ==================== CASH PERIODS ====================

// @desc    Get all cash periods
// @route   GET /api/cash/periods
// @access  Private
exports.getAllPeriods = async (req, res, next) => {
  try {
    const { is_active } = req.query;

    const where = {};
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const periods = await CashPeriod.findAll({
      where,
      order: [['due_date', 'DESC']]
    });

    successResponse(res, periods);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single period
// @route   GET /api/cash/periods/:id
// @access  Private
exports.getPeriod = async (req, res, next) => {
  try {
    const period = await CashPeriod.findByPk(req.params.id);

    if (!period) {
      return errorResponse(res, 'Cash period not found', 404);
    }

    successResponse(res, period);
  } catch (error) {
    next(error);
  }
};

// @desc    Create cash period
// @route   POST /api/admin/cash/periods
// @access  Private (Finance role)
exports.createPeriod = async (req, res, next) => {
  try {
    const { name, amount, late_fee_per_day, due_date } = req.body;

    if (!name || !amount || !due_date) {
      return errorResponse(res, 'Name, amount, and due_date are required', 400);
    }

    const period = await CashPeriod.create({
      name,
      amount,
      late_fee_per_day: late_fee_per_day || 0,
      due_date,
      is_active: true
    });

    successResponse(res, period, 'Cash period created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cash period
// @route   PUT /api/admin/cash/periods/:id
// @access  Private (Finance role)
exports.updatePeriod = async (req, res, next) => {
  try {
    const { name, amount, late_fee_per_day, due_date, is_active } = req.body;

    const period = await CashPeriod.findByPk(req.params.id);
    
    if (!period) {
      return errorResponse(res, 'Cash period not found', 404);
    }

    if (name) period.name = name;
    if (amount) period.amount = amount;
    if (late_fee_per_day !== undefined) period.late_fee_per_day = late_fee_per_day;
    if (due_date) period.due_date = due_date;
    if (is_active !== undefined) period.is_active = is_active;

    await period.save();

    successResponse(res, period, 'Cash period updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete cash period
// @route   DELETE /api/admin/cash/periods/:id
// @access  Private (Finance role)
exports.deletePeriod = async (req, res, next) => {
  try {
    const period = await CashPeriod.findByPk(req.params.id);
    
    if (!period) {
      return errorResponse(res, 'Cash period not found', 404);
    }

    // Check if period has transactions
    const transactionCount = await CashTransaction.count({
      where: { period_id: req.params.id }
    });

    if (transactionCount > 0) {
      return errorResponse(res, 'Cannot delete period with existing transactions', 400);
    }

    await period.destroy();

    successResponse(res, null, 'Cash period deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ==================== CASH TRANSACTIONS ====================

// @desc    Get my cash transactions
// @route   GET /api/cash/my-transactions
// @access  Private (All users)
exports.getMyTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, period_id } = req.query;
    const offset = (page - 1) * limit;

    const where = { user_id: req.user.id };
    if (status) where.status = status;
    if (period_id) where.period_id = period_id;

    const { count, rows } = await CashTransaction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: CashPeriod,
          as: 'period',
          attributes: ['id', 'name', 'amount', 'due_date', 'late_fee_per_day']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['payment_date', 'DESC']]
    });

    paginatedResponse(res, rows, page, limit, count);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit cash payment
// @route   POST /api/cash/transactions
// @access  Private (All users)
exports.submitTransaction = async (req, res, next) => {
  try {
    const { period_id, payment_method, payment_date } = req.body;

    if (!period_id || !payment_method || !payment_date) {
      return errorResponse(res, 'Period ID, payment method, and payment date are required', 400);
    }

    // Get period details
    const period = await CashPeriod.findByPk(period_id);
    if (!period) {
      return errorResponse(res, 'Cash period not found', 404);
    }

    if (!period.is_active) {
      return errorResponse(res, 'This cash period is no longer active', 400);
    }

    // Check if user already paid for this period
    const existingTransaction = await CashTransaction.findOne({
      where: {
        user_id: req.user.id,
        period_id,
        status: { [Op.in]: ['COMPLETE', 'PENDING'] }
      }
    });

    if (existingTransaction) {
      return errorResponse(res, 'You have already submitted payment for this period', 400);
    }

    // Calculate late fee
    const lateFee = calculateLateFee(period.due_date, payment_date, period.late_fee_per_day);

    // For TRANSFER, proof is required
    if (payment_method === 'TRANSFER' && !req.file) {
      return errorResponse(res, 'Payment proof is required for transfer payments', 400);
    }

    const transaction = await CashTransaction.create({
      user_id: req.user.id,
      period_id,
      amount_paid: period.amount,
      fine_amount: lateFee,
      payment_date,
      payment_method,
      proof_image_url: req.file ? `/uploads/proofs/${req.file.filename}` : null,
      status: payment_method === 'CASH' ? 'COMPLETE' : 'PENDING'
    });

    const createdTransaction = await CashTransaction.findByPk(transaction.id, {
      include: [
        {
          model: CashPeriod,
          as: 'period'
        }
      ]
    });

    successResponse(res, createdTransaction, 'Payment submitted successfully', 201);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// ==================== ADMIN/FINANCE ROUTES ====================

// @desc    Get all transactions with filters
// @route   GET /api/admin/cash/transactions
// @access  Private (Finance role)
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, period_id, user_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (period_id) where.period_id = period_id;
    if (user_id) where.user_id = user_id;

    const { count, rows } = await CashTransaction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: CashPeriod,
          as: 'period',
          attributes: ['id', 'name', 'amount', 'due_date']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['payment_date', 'DESC']]
    });

    paginatedResponse(res, rows, page, limit, count);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify transaction
// @route   PUT /api/admin/cash/transactions/:id/verify
// @access  Private (Finance role)
exports.verifyTransaction = async (req, res, next) => {
  try {
    const { status } = req.body; // COMPLETE or REJECTED

    if (!status || !['COMPLETE', 'REJECTED'].includes(status)) {
      return errorResponse(res, 'Status must be either COMPLETE or REJECTED', 400);
    }

    const transaction = await CashTransaction.findByPk(req.params.id);
    
    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    if (transaction.status !== 'PENDING') {
      return errorResponse(res, 'Only pending transactions can be verified', 400);
    }

    transaction.status = status;
    transaction.verifier_id = req.user.id;

    await transaction.save();

    const updatedTransaction = await CashTransaction.findByPk(transaction.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: CashPeriod,
          as: 'period'
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    successResponse(res, updatedTransaction, `Transaction ${status.toLowerCase()} successfully`);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment statistics
// @route   GET /api/admin/cash/statistics
// @access  Private (Finance role)
exports.getStatistics = async (req, res, next) => {
  try {
    const { period_id } = req.query;

    if (!period_id) {
      return errorResponse(res, 'Period ID is required', 400);
    }

    const period = await CashPeriod.findByPk(period_id);
    if (!period) {
      return errorResponse(res, 'Cash period not found', 404);
    }

    const totalMembers = await User.count();
    
    const paidCount = await CashTransaction.count({
      where: {
        period_id,
        status: 'COMPLETE'
      }
    });

    const pendingCount = await CashTransaction.count({
      where: {
        period_id,
        status: 'PENDING'
      }
    });

    const totalCollected = await CashTransaction.sum('amount_paid', {
      where: {
        period_id,
        status: 'COMPLETE'
      }
    });

    const totalFines = await CashTransaction.sum('fine_amount', {
      where: {
        period_id,
        status: 'COMPLETE'
      }
    });

    const unpaidCount = totalMembers - paidCount - pendingCount;

    successResponse(res, {
      period: {
        id: period.id,
        name: period.name,
        amount: period.amount,
        due_date: period.due_date
      },
      statistics: {
        total_members: totalMembers,
        paid_count: paidCount,
        pending_count: pendingCount,
        unpaid_count: unpaidCount,
        total_collected: totalCollected || 0,
        total_fines: totalFines || 0,
        payment_rate: ((paidCount / totalMembers) * 100).toFixed(2) + '%'
      }
    });
  } catch (error) {
    next(error);
  }
};