const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');
const { uploadCSV } = require('../middlewares/upload');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  bulkUploadUsers,
  downloadCSVTemplate
} = require('../controllers/userController');

router.use(authenticate);
router.use(checkPermission('users.manage')); // Only HR can access

router.get('/', getAllUsers);
router.get('/csv-template', downloadCSVTemplate);
router.post('/bulk-upload', uploadCSV, bulkUploadUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;