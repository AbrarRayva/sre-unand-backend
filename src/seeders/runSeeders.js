require('dotenv').config();
const { sequelize, syncDatabase } = require('../models');

const seedDivisions = require('./01-divisions');
const seedSubDivisions = require('./02-subdivisions');
const seedRolesAndPermissions = require('./03-roles');
const seedPermissions = require('./04-permissions');
const seedRolePermissions = require('./05-role-permissions');
const seedSuperAdmin = require('./06-super-admin');

const runSeeders = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Sync database
    await syncDatabase();
    
    // Run seeders in order
    await seedDivisions();
    await seedSubDivisions();
    await seedRolesAndPermissions();
    await seedPermissions();
    await seedRolePermissions();
    await seedSuperAdmin();
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

runSeeders();