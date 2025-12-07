const jwt = require('jsonwebtoken');
const { User, Role, UserRole, Division, SubDivision } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (but in production, you might want to restrict this)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, position, division_id, sub_division_id } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email, and password', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 400);
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

    // Assign default MEMBER role
    const memberRole = await Role.findOne({ where: { name: 'MEMBER' } });
    if (memberRole) {
      await UserRole.create({
        user_id: user.id,
        role_id: memberRole.id
      });
    }

    // Generate token
    const token = generateToken(user.id);

    successResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        position: user.position
      },
      token
    }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    // Find user
    const user = await User.scope('withPassword').findOne({
      where: { email },
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
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user.id);

    successResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        position: user.position,
        division: user.division,
        subDivision: user.subDivision,
        roles: user.roles.map(role => role.name)
      },
      token
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
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

    successResponse(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      position: user.position,
      division: user.division,
      subDivision: user.subDivision,
      roles: user.roles.map(role => role.name)
    }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return errorResponse(res, 'Please provide old and new password', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters', 400);
    }

    const user = await User.findByPk(req.user.id);

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return errorResponse(res, 'Old password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};