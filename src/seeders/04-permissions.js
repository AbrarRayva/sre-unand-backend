const { Permission } = require('../models');

const permissions = [
  // User Management
  { slug: 'users.view', description: 'View users', module: 'USERS' },
  { slug: 'users.manage', description: 'Manage users (create, update, delete)', module: 'USERS' },
  
  // Division Management
  { slug: 'divisions.view', description: 'View divisions and members', module: 'DIVISIONS' },
  { slug: 'divisions.manage', description: 'Manage divisions', module: 'DIVISIONS' },
  
  // Work Programs
  { slug: 'work_programs.view', description: 'View work programs', module: 'WORK_PROGRAMS' },
  { slug: 'work_programs.manage', description: 'Manage work programs', module: 'WORK_PROGRAMS' },
  
  // Documents
  { slug: 'documents.view', description: 'View documents', module: 'DOCUMENTS' },
  { slug: 'documents.manage', description: 'Manage documents', module: 'DOCUMENTS' },
  
  // Articles
  { slug: 'articles.view', description: 'View articles', module: 'ARTICLES' },
  { slug: 'articles.manage', description: 'Manage articles', module: 'ARTICLES' },
  
  // Cash
  { slug: 'cash.view_own', description: 'View own cash transactions', module: 'CASH' },
  { slug: 'cash.submit', description: 'Submit cash payments', module: 'CASH' },
  { slug: 'cash.manage', description: 'Manage cash periods and verify payments', module: 'CASH' }
];

module.exports = async () => {
  try {
    console.log('📄 Seeding permissions...');
    for (const perm of permissions) {
      await Permission.findOrCreate({
        where: { slug: perm.slug },
        defaults: perm
      });
    }
    console.log('✅ Permissions seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
};