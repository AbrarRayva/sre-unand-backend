const { sequelize } = require('../config/database');

// Import per-file models
const User = require('./User');
const Division = require('./Division');
const SubDivision = require('./SubDivision');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const UserRole = require('./UserRole');
const WorkProgram = require('./WorkProgram');
const WorkProgramPic = require('./WorkProgramPic');
const Document = require('./Document');
const Article = require('./Article');
const CashPeriod = require('./CashPeriod');
const CashTransaction = require('./CashTransaction');

// Define associations
User.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });
Division.hasMany(User, { foreignKey: 'division_id', as: 'users' });

User.belongsTo(SubDivision, { foreignKey: 'sub_division_id', as: 'subDivision' });
SubDivision.hasMany(User, { foreignKey: 'sub_division_id', as: 'users' });

SubDivision.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });
Division.hasMany(SubDivision, { foreignKey: 'division_id', as: 'subDivisions' });

User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', as: 'users' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', as: 'roles' });

WorkProgram.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });
Division.hasMany(WorkProgram, { foreignKey: 'division_id', as: 'workPrograms' });

WorkProgram.belongsToMany(User, { through: WorkProgramPic, foreignKey: 'work_programs_id', as: 'pics' });
User.belongsToMany(WorkProgram, { through: WorkProgramPic, foreignKey: 'user_id', as: 'assignedPrograms' });

Document.belongsTo(User, { foreignKey: 'uploader_id', as: 'uploader' });
User.hasMany(Document, { foreignKey: 'uploader_id', as: 'uploadedDocuments' });

Article.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.hasMany(Article, { foreignKey: 'author_id', as: 'articles' });
Article.belongsTo(User, { foreignKey: 'editor_id', as: 'editor' });
User.hasMany(Article, { foreignKey: 'editor_id', as: 'editedArticles' });

CashTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(CashTransaction, { foreignKey: 'user_id', as: 'cashTransactions' });
CashTransaction.belongsTo(User, { foreignKey: 'verifier_id', as: 'verifier' });
User.hasMany(CashTransaction, { foreignKey: 'verifier_id', as: 'verifiedTransactions' });

CashTransaction.belongsTo(CashPeriod, { foreignKey: 'period_id', as: 'period' });
CashPeriod.hasMany(CashTransaction, { foreignKey: 'period_id', as: 'transactions' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Division,
  SubDivision,
  Role,
  Permission,
  RolePermission,
  UserRole,
  WorkProgram,
  WorkProgramPic,
  Document,
  Article,
  CashPeriod,
  CashTransaction,
  syncDatabase
};