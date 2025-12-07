const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');
const { uploadDocument } = require('../middlewares/upload');
const {
  getAllDocuments,
  getDocument,
  uploadDocument: uploadDoc,
  updateDocument,
  deleteDocument,
  downloadDocument
} = require('../controllers/documentController');

// Public routes (all authenticated users)
router.get('/', authenticate, getAllDocuments);
router.get('/:id', authenticate, getDocument);
router.get('/:id/download', authenticate, downloadDocument);

// Protected routes (Secretary)
router.post('/', authenticate, checkPermission('documents.manage'), uploadDocument, uploadDoc);
router.put('/:id', authenticate, checkPermission('documents.manage'), updateDocument);
router.delete('/:id', authenticate, checkPermission('documents.manage'), deleteDocument);

module.exports = router;
