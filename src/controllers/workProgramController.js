const { WorkProgram, Division, User, WorkProgramPic } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHelper');
const { Op } = require('sequelize');

// @desc    Get all work programs with pagination and filters
// @route   GET /api/work-programs
// @access  Private (All authenticated users)
exports.getAllWorkPrograms = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, division_id, status, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (division_id) where.division_id = division_id;
    if (status) where.status = status;
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await WorkProgram.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'pics',
          through: { attributes: [] },
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

// @desc    Get single work program
// @route   GET /api/work-programs/:id
// @access  Private
exports.getWorkProgram = async (req, res, next) => {
  try {
    const workProgram = await WorkProgram.findByPk(req.params.id, {
      include: [
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'pics',
          through: { attributes: [] },
          attributes: ['id', 'name', 'email', 'position']
        }
      ]
    });

    if (!workProgram) {
      return errorResponse(res, 'Work program not found', 404);
    }

    successResponse(res, workProgram);
  } catch (error) {
    next(error);
  }
};

// @desc    Create work program
// @route   POST /api/admin/work-programs
// @access  Private (Directors and Admin)
exports.createWorkProgram = async (req, res, next) => {
  try {
    const { name, division_id, targets, status, pic_ids } = req.body;

    if (!name || !division_id) {
      return errorResponse(res, 'Name and division_id are required', 400);
    }

    // Verify division exists
    const division = await Division.findByPk(division_id);
    if (!division) {
      return errorResponse(res, 'Division not found', 404);
    }

    // Check if user is director of this division or admin
    const isAdmin = req.user.roles.some(role => role.name === 'ADMIN');
    const isDirectorOfDivision = req.user.position === 'DIRECTOR' && req.user.division_id == division_id;

    if (!isAdmin && !isDirectorOfDivision) {
      return errorResponse(res, 'You can only create work programs for your division', 403);
    }

    // Create work program
    const workProgram = await WorkProgram.create({
      name,
      division_id,
      targets: targets || [],
      status: status || 'PLANNED'
    });

    // Assign PICs
    if (pic_ids && Array.isArray(pic_ids) && pic_ids.length > 0) {
      const pics = await User.findAll({
        where: { id: pic_ids }
      });
      await workProgram.addPics(pics);
    }

    // Fetch created work program with associations
    const createdWorkProgram = await WorkProgram.findByPk(workProgram.id, {
      include: [
        {
          model: Division,
          as: 'division'
        },
        {
          model: User,
          as: 'pics',
          through: { attributes: [] }
        }
      ]
    });

    successResponse(res, createdWorkProgram, 'Work program created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update work program
// @route   PUT /api/admin/work-programs/:id
// @access  Private (Directors and Admin)
exports.updateWorkProgram = async (req, res, next) => {
  try {
    const { name, targets, status, pic_ids } = req.body;

    const workProgram = await WorkProgram.findByPk(req.params.id);
    
    if (!workProgram) {
      return errorResponse(res, 'Work program not found', 404);
    }

    // Check if user is director of this division or admin
    const isAdmin = req.user.roles.some(role => role.name === 'ADMIN');
    const isDirectorOfDivision = req.user.position === 'DIRECTOR' && req.user.division_id == workProgram.division_id;

    if (!isAdmin && !isDirectorOfDivision) {
      return errorResponse(res, 'You can only update work programs for your division', 403);
    }

    // Update fields
    if (name) workProgram.name = name;
    if (targets) workProgram.targets = targets;
    if (status) workProgram.status = status;

    await workProgram.save();

    // Update PICs if provided
    if (pic_ids && Array.isArray(pic_ids)) {
      const pics = await User.findAll({
        where: { id: pic_ids }
      });
      await workProgram.setPics(pics);
    }

    // Fetch updated work program
    const updatedWorkProgram = await WorkProgram.findByPk(workProgram.id, {
      include: [
        {
          model: Division,
          as: 'division'
        },
        {
          model: User,
          as: 'pics',
          through: { attributes: [] }
        }
      ]
    });

    successResponse(res, updatedWorkProgram, 'Work program updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete work program
// @route   DELETE /api/admin/work-programs/:id
// @access  Private (Directors and Admin)
exports.deleteWorkProgram = async (req, res, next) => {
  try {
    const workProgram = await WorkProgram.findByPk(req.params.id);
    
    if (!workProgram) {
      return errorResponse(res, 'Work program not found', 404);
    }

    // Check if user is director of this division or admin
    const isAdmin = req.user.roles.some(role => role.name === 'ADMIN');
    const isDirectorOfDivision = req.user.position === 'DIRECTOR' && req.user.division_id == workProgram.division_id;

    if (!isAdmin && !isDirectorOfDivision) {
      return errorResponse(res, 'You can only delete work programs for your division', 403);
    }

    await workProgram.destroy();

    successResponse(res, null, 'Work program deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get work programs by division
// @route   GET /api/divisions/:divisionId/work-programs
// @access  Private
exports.getWorkProgramsByDivision = async (req, res, next) => {
  try {
    const workPrograms = await WorkProgram.findAll({
      where: { division_id: req.params.divisionId },
      include: [
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'pics',
          through: { attributes: [] },
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['id', 'DESC']]
    });

    successResponse(res, workPrograms);
  } catch (error) {
    next(error);
  }
};