const { Article, User } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHelper');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// @desc    Get all published articles (PUBLIC - no auth required)
// @route   GET /api/articles
// @access  Public
exports.getPublishedArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { status: 'PUBLISHED' };
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Article.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'editor',
          attributes: ['id', 'name']
        }
      ],
      order: [['publish_date', 'DESC']]
    });

    paginatedResponse(res, rows, page, limit, count);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single published article (PUBLIC - no auth required)
// @route   GET /api/articles/:id
// @access  Public
exports.getPublishedArticle = async (req, res, next) => {
  try {
    const article = await Article.findOne({
      where: {
        id: req.params.id,
        status: 'PUBLISHED'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'editor',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!article) {
      return errorResponse(res, 'Article not found', 404);
    }

    successResponse(res, article);
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN ROUTES ====================

// @desc    Get all articles (including drafts and archived)
// @route   GET /api/admin/articles
// @access  Private (Media role)
exports.getAllArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (status) where.status = status;
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Article.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'editor',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['id', 'DESC']]
    });

    paginatedResponse(res, rows, page, limit, count);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single article (for editing)
// @route   GET /api/admin/articles/:id
// @access  Private (Media role)
exports.getArticle = async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'editor',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!article) {
      return errorResponse(res, 'Article not found', 404);
    }

    successResponse(res, article);
  } catch (error) {
    next(error);
  }
};

// @desc    Create article
// @route   POST /api/admin/articles
// @access  Private (Media role)
exports.createArticle = async (req, res, next) => {
  try {
    const { title, content, status } = req.body;

    if (!title || !content) {
      return errorResponse(res, 'Title and content are required', 400);
    }

    const articleData = {
      author_id: req.user.id,
      title,
      content,
      status: status || 'DRAFT',
      image_url: req.file ? `/uploads/articles/${req.file.filename}` : null
    };

    // If publishing, set publish date
    if (articleData.status === 'PUBLISHED') {
      articleData.publish_date = new Date();
    }

    const article = await Article.create(articleData);

    const createdArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    successResponse(res, createdArticle, 'Article created successfully', 201);
  } catch (error) {
    // Delete uploaded image on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Update article
// @route   PUT /api/admin/articles/:id
// @access  Private (Media role)
exports.updateArticle = async (req, res, next) => {
  try {
    const { title, content, status } = req.body;

    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return errorResponse(res, 'Article not found', 404);
    }

    const oldStatus = article.status;
    const oldImageUrl = article.image_url;

    // Update fields
    if (title) article.title = title;
    if (content) article.content = content;
    if (status) article.status = status;
    
    // Update editor info
    article.editor_id = req.user.id;
    article.last_edit_date = new Date();

    // If status changed to PUBLISHED and wasn't published before, set publish date
    if (status === 'PUBLISHED' && oldStatus !== 'PUBLISHED') {
      article.publish_date = new Date();
    }

    // Update image if new one uploaded
    if (req.file) {
      // Delete old image if exists
      if (oldImageUrl) {
        const oldImagePath = path.join(__dirname, '../../', oldImageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      article.image_url = `/uploads/articles/${req.file.filename}`;
    }

    await article.save();

    const updatedArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'editor',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    successResponse(res, updatedArticle, 'Article updated successfully');
  } catch (error) {
    // Delete uploaded image on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Delete article
// @route   DELETE /api/admin/articles/:id
// @access  Private (Media role)
exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return errorResponse(res, 'Article not found', 404);
    }

    // Delete image if exists
    if (article.image_url) {
      const imagePath = path.join(__dirname, '../../', article.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await article.destroy();

    successResponse(res, null, 'Article deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Publish article
// @route   PUT /api/admin/articles/:id/publish
// @access  Private (Media role)
exports.publishArticle = async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return errorResponse(res, 'Article not found', 404);
    }

    article.status = 'PUBLISHED';
    article.publish_date = new Date();
    article.editor_id = req.user.id;
    article.last_edit_date = new Date();

    await article.save();

    const publishedArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'editor',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    successResponse(res, publishedArticle, 'Article published successfully');
  } catch (error) {
    next(error);
  }
};