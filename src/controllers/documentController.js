const { Document, User } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHelper');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Helper function to check document access
const canAccessDocument = (user, document) => {
  const userRoles = user.roles.map(r => r.name);
  const isAdmin = userRoles.includes('ADMIN');
  
  if (isAdmin) return true;

  const accessLevel = document.access_level;
  const userPosition = user.position;

  switch (accessLevel) {
    case 'PUBLIC':
      return true;
    case 'BOARD':
      // BOARD: Directors and Executive
      return ['P', 'VP', 'SEC', 'DIRECTOR'].includes(userPosition);
    case 'EXECUTIVE':
      // EXECUTIVE: President, Vice President, General Secretary
      return ['P', 'VP', 'SEC'].includes(userPosition);
    default:
      return false;
  }
};

// @desc    Get all documents with access control
// @route   GET /api/documents
// @access  Private
exports.getAllDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, access_level } = req.query;
    const offset = (page - 1) * limit;

    // Determine user's access level
    const userRoles = req.user.roles.map(r => r.name);
    const isAdmin = userRoles.includes('ADMIN');
    const userPosition = req.user.position;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (access_level) {
      where.access_level = access_level;
    }

    // Apply access control filters
    if (!isAdmin) {
      if (['P', 'VP', 'SEC'].includes(userPosition)) {
        // Executive can see all
        where.access_level = { [Op.in]: ['PUBLIC', 'BOARD', 'EXECUTIVE'] };
      } else if (userPosition === 'DIRECTOR') {
        // Directors can see PUBLIC and BOARD
        where.access_level = { [Op.in]: ['PUBLIC', 'BOARD'] };
      } else {
        // Others can only see PUBLIC
        where.access_level = 'PUBLIC';
      }
    }

    const { count, rows } = await Document.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['uploaded_at', 'DESC']]
    });

    paginatedResponse(res, rows, page, limit, count);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    // Check access
    if (!canAccessDocument(req.user, document)) {
      return errorResponse(res, 'You do not have permission to access this document', 403);
    }

    successResponse(res, document);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document
// @route   POST /api/admin/documents
// @access  Private (Secretary role)
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload a document file', 400);
    }

    const { title, description, access_level } = req.body;

    if (!title) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 'Title is required', 400);
    }

    const document = await Document.create({
      uploader_id: req.user.id,
      title,
      description,
      file_url: `/uploads/documents/${req.file.filename}`,
      access_level: access_level || 'PUBLIC'
    });

    const createdDocument = await Document.findByPk(document.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    successResponse(res, createdDocument, 'Document uploaded successfully', 201);
  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Update document metadata
// @route   PUT /api/admin/documents/:id
// @access  Private (Secretary role)
exports.updateDocument = async (req, res, next) => {
  try {
    const { title, description, access_level } = req.body;

    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (access_level) document.access_level = access_level;

    await document.save();

    const updatedDocument = await Document.findByPk(document.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    successResponse(res, updatedDocument, 'Document updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/admin/documents/:id
// @access  Private (Secretary role)
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../', document.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.destroy();

    successResponse(res, null, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
exports.downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    // Check access
    if (!canAccessDocument(req.user, document)) {
      return errorResponse(res, 'You do not have permission to download this document', 403);
    }

    const filePath = path.join(__dirname, '../../', document.file_url);
    
    if (!fs.existsSync(filePath)) {
      return errorResponse(res, 'File not found on server', 404);
    }

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};