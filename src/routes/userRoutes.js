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
  downloadCSVTemplate,
  getRoles // Memastikan fungsi ini diimport
} = require('../controllers/userController');

router.use(authenticate);
router.use(checkPermission('users.manage')); // Proteksi akses HR/Admin

// Rute Statis (Harus di atas rute dinamis /:id)
router.get('/', getAllUsers);
router.get('/roles', getRoles); // Endpoint untuk UserService.getRoles
router.get('/csv-template', downloadCSVTemplate);

// Rute dengan Middleware File Upload
router.post('/bulk-upload', uploadCSV, bulkUploadUsers);

// Rute Dinamis dan CRUD
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;