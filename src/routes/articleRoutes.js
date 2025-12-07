const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');
const { uploadArticleImage } = require('../middlewares/upload');
const {
  getPublishedArticles,
  getPublishedArticle,
  getAllArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle
} = require('../controllers/articleController');

// PUBLIC routes (no authentication required for published articles)
router.get('/published', getPublishedArticles);
router.get('/published/:id', getPublishedArticle);

// ADMIN routes (Media role)
router.get('/admin', authenticate, checkPermission('articles.manage'), getAllArticles);
router.get('/admin/:id', authenticate, checkPermission('articles.manage'), getArticle);
router.post('/admin', authenticate, checkPermission('articles.manage'), uploadArticleImage, createArticle);
router.put('/admin/:id', authenticate, checkPermission('articles.manage'), uploadArticleImage, updateArticle);
router.put('/admin/:id/publish', authenticate, checkPermission('articles.manage'), publishArticle);
router.delete('/admin/:id', authenticate, checkPermission('articles.manage'), deleteArticle);

module.exports = router;