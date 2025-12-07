const { Division, SubDivision, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc    Get all divisions with subdivisions and members
// @route   GET /api/divisions
// @access  Private (All authenticated users)
exports.getAllDivisions = async (req, res, next) => {
  try {
    const divisions = await Division.findAll({
      include: [
        {
          model: SubDivision,
          as: 'subDivisions',
          include: [
            {
              model: User,
              as: 'users',
              attributes: ['id', 'name', 'email', 'position']
            }
          ]
        },
        {
          model: User,
          as: 'users',
          where: { sub_division_id: null },
          required: false,
          attributes: ['id', 'name', 'email', 'position']
        }
      ],
      order: [['id', 'ASC']]
    });

    successResponse(res, divisions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single division
// @route   GET /api/divisions/:id
// @access  Private
exports.getDivision = async (req, res, next) => {
  try {
    const division = await Division.findByPk(req.params.id, {
      include: [
        {
          model: SubDivision,
          as: 'subDivisions',
          include: [
            {
              model: User,
              as: 'users',
              attributes: ['id', 'name', 'email', 'position']
            }
          ]
        },
        {
          model: User,
          as: 'users',
          where: { sub_division_id: null },
          required: false,
          attributes: ['id', 'name', 'email', 'position']
        }
      ]
    });

    if (!division) {
      return errorResponse(res, 'Division not found', 404);
    }

    successResponse(res, division);
  } catch (error) {
    next(error);
  }
};

// @desc    Create division (Admin only)
// @route   POST /api/admin/divisions
// @access  Private (Admin)
exports.createDivision = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return errorResponse(res, 'Division name is required', 400);
    }

    const division = await Division.create({
      name,
      description
    });

    successResponse(res, division, 'Division created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update division (Admin only)
// @route   PUT /api/admin/divisions/:id
// @access  Private (Admin)
exports.updateDivision = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const division = await Division.findByPk(req.params.id);
    
    if (!division) {
      return errorResponse(res, 'Division not found', 404);
    }

    if (name) division.name = name;
    if (description !== undefined) division.description = description;

    await division.save();

    successResponse(res, division, 'Division updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete division (Admin only)
// @route   DELETE /api/admin/divisions/:id
// @access  Private (Admin)
exports.deleteDivision = async (req, res, next) => {
  try {
    const division = await Division.findByPk(req.params.id);
    
    if (!division) {
      return errorResponse(res, 'Division not found', 404);
    }

    // Check if division has users
    const userCount = await User.count({
      where: { division_id: req.params.id }
    });

    if (userCount > 0) {
      return errorResponse(res, 'Cannot delete division with members. Please reassign members first.', 400);
    }

    await division.destroy();

    successResponse(res, null, 'Division deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get division members
// @route   GET /api/divisions/:id/members
// @access  Private
exports.getDivisionMembers = async (req, res, next) => {
  try {
    const division = await Division.findByPk(req.params.id);
    
    if (!division) {
      return errorResponse(res, 'Division not found', 404);
    }

    const members = await User.findAll({
      where: { division_id: req.params.id },
      include: [
        {
          model: SubDivision,
          as: 'subDivision',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'name', 'email', 'position'],
      order: [['name', 'ASC']]
    });

    successResponse(res, members);
  } catch (error) {
    next(error);
  }
};