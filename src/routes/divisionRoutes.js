const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  getAllDivisions,
  getDivision,
  getDivisionMembers
} = require('../controllers/divisionController');

// Public routes (require authentication only)
router.use(authenticate);
router.get('/', getAllDivisions);
router.get('/:id', getDivision);
router.get('/:id/members', getDivisionMembers);

module.exports = router;