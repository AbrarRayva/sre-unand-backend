const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');
const { uploadProof } = require('../middlewares/upload');
const {
  getAllPeriods,
  getPeriod,
  createPeriod,
  updatePeriod,
  deletePeriod,
  getMyTransactions,
  submitTransaction,
  getAllTransactions,
  verifyTransaction,
  getStatistics
} = require('../controllers/cashController');

// Public routes (all authenticated users)
router.get('/periods', authenticate, getAllPeriods);
router.get('/periods/:id', authenticate, getPeriod);
router.get('/my-transactions', authenticate, getMyTransactions);
router.post('/transactions', authenticate, uploadProof, submitTransaction);

// Admin routes (Finance role)
router.post('/admin/periods', authenticate, checkPermission('cash.manage'), createPeriod);
router.put('/admin/periods/:id', authenticate, checkPermission('cash.manage'), updatePeriod);
router.delete('/admin/periods/:id', authenticate, checkPermission('cash.manage'), deletePeriod);
router.get('/admin/transactions', authenticate, checkPermission('cash.manage'), getAllTransactions);
router.put('/admin/transactions/:id/verify', authenticate, checkPermission('cash.manage'), verifyTransaction);
router.get('/admin/statistics', authenticate, checkPermission('cash.manage'), getStatistics);

module.exports = router;