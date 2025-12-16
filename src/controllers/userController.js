const { User, Role, UserRole, Division, SubDivision } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHelper');
const { parseCSV, validateUserCSV } = require('../utils/csvParser');
const { Op } = require('sequelize');

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private (HR role)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, division_id, position } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (division_id) {
      where.division_id = division_id;
    }
    if (position) {
      where.position = position;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        },
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name']
        },
        {
          model: SubDivision,
          as: 'subDivision',
          attributes: ['id', 'name']
        }
      ],
      order: [['id', 'ASC']]
    });

    paginatedResponse(res, rows, page, limit, count);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (HR role)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        },
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name']
        },
        {
          model: SubDivision,
          as: 'subDivision',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private (HR role)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, position, division_id, sub_division_id, roles } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email, and password', 400);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email already exists', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      position: position || 'STAFF',
      division_id: division_id || null,
      sub_division_id: sub_division_id || null
    });

    // Assign roles
    if (roles && Array.isArray(roles) && roles.length > 0) {
      const roleRecords = await Role.findAll({
        where: { id: roles }
      });
      await user.addRoles(roleRecords);
    } else {
      // Assign default MEMBER role
      const memberRole = await Role.findOne({ where: { name: 'MEMBER' } });
      if (memberRole) {
        await user.addRole(memberRole);
      }
    }

    // Fetch user with roles
    const createdUser = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        },
        {
          model: Division,
          as: 'division'
        },
        {
          model: SubDivision,
          as: 'subDivision'
        }
      ]
    });

    successResponse(res, createdUser, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (HR role)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, position, division_id, sub_division_id, roles } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return errorResponse(res, 'Email already exists', 400);
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (position) user.position = position;
    if (division_id !== undefined) user.division_id = division_id;
    if (sub_division_id !== undefined) user.sub_division_id = sub_division_id;

    await user.save();

    // Update roles if provided
    if (roles && Array.isArray(roles)) {
      const roleRecords = await Role.findAll({
        where: { id: roles }
      });
      await user.setRoles(roleRecords);
    }

    // Fetch updated user
    const updatedUser = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        },
        {
          model: Division,
          as: 'division'
        },
        {
          model: SubDivision,
          as: 'subDivision'
        }
      ]
    });

    successResponse(res, updatedUser, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (HR role)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await user.destroy();

    successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk upload users via CSV
// @route   POST /api/admin/users/bulk-upload
// @access  Private (HR role)
exports.bulkUploadUsers = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload a CSV file', 400);
    }

    // Parse CSV
    const users = await parseCSV(req.file.buffer);

    // Validate CSV data
    const validationErrors = validateUserCSV(users);
    if (validationErrors.length > 0) {
      return errorResponse(res, 'CSV validation failed', 400, validationErrors);
    }

    // Check for duplicate emails in CSV
    const emails = users.map(u => u.email.toLowerCase());
    const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicateEmails.length > 0) {
      return errorResponse(res, 'Duplicate emails found in CSV', 400, {
        duplicates: [...new Set(duplicateEmails)]
      });
    }

    // Check for existing emails in database
    const existingUsers = await User.findAll({
      where: {
        email: { [Op.in]: emails }
      }
    });

    if (existingUsers.length > 0) {
      return errorResponse(res, 'Some emails already exist in database', 400, {
        existingEmails: existingUsers.map(u => u.email)
      });
    }

    // Get default MEMBER role
    const memberRole = await Role.findOne({ where: { name: 'MEMBER' } });

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create({
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: userData.password,
        position: userData.position ? userData.position.toUpperCase() : 'STAFF',
        division_id: userData.division_id || null,
        sub_division_id: userData.sub_division_id || null
      });

      // Assign MEMBER role
      if (memberRole) {
        await user.addRole(memberRole);
      }

      createdUsers.push(user);
    }

    successResponse(res, {
      count: createdUsers.length,
      users: createdUsers
    }, `${createdUsers.length} users created successfully`, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Download CSV template
// @route   GET /api/admin/users/csv-template
// @access  Private (HR role)
exports.downloadCSVTemplate = async (req, res, next) => {
  try {
    const csvContent = 'name,email,password,position,division_id,sub_division_id\n' +
                       'John Doe,john@example.com,password123,STAFF,1,1\n' +
                       'Jane Smith,jane@example.com,password123,MANAGER,2,';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=user-upload-template.csv');
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available roles
// @route   GET /api/admin/users/roles
// @access  Private (HR role)
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      order: [['id', 'ASC']]
    });
    successResponse(res, roles);
  } catch (error) {
    next(error);
  }
};