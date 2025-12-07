const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');
const {
  getAllWorkPrograms,
  getWorkProgram,
  createWorkProgram,
  updateWorkProgram,
  deleteWorkProgram,
  getWorkProgramsByDivision
} = require('../controllers/workProgramController');

// Public routes (all authenticated users)
router.get('/', authenticate, getAllWorkPrograms);
router.get('/:id', authenticate, getWorkProgram);
router.get('/division/:divisionId', authenticate, getWorkProgramsByDivision);

// Protected routes (Directors and Admin)
router.post('/', authenticate, checkPermission('workprograms.manage'), createWorkProgram);
router.put('/:id', authenticate, checkPermission('workprograms.manage'), updateWorkProgram);
router.delete('/:id', authenticate, checkPermission('workprograms.manage'), deleteWorkProgram);

module.exports = router;