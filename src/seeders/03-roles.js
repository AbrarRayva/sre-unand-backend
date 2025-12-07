const { Role, Permission, RolePermission } = require('../models');

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

const roles = [
  {
    name: 'ADMIN',
    is_protected: true,
    permissions: 'ALL' // All permissions
  },
  {
    name: 'MEMBER',
    is_protected: true,
    permissions: [
      'divisions.view',
      'work_programs.view',
      'documents.view',
      'articles.view',
      'cash.view_own',
      'cash.submit'
    ]
  },
  {
    name: 'HR',
    is_protected: false,
    permissions: [
      'users.view',
      'users.manage',
      'divisions.view',
      'work_programs.view',
      'documents.view',
      'articles.view',
      'cash.view_own',
      'cash.submit'
    ]
  },
  {
    name: 'Secretary',
    is_protected: false,
    permissions: [
      'divisions.view',
      'work_programs.view',
      'documents.view',
      'documents.manage',
      'articles.view',
      'cash.view_own',
      'cash.submit'
    ]
  },
  {
    name: 'Media',
    is_protected: false,
    permissions: [
      'divisions.view',
      'work_programs.view',
      'documents.view',
      'articles.view',
      'articles.manage',
      'cash.view_own',
      'cash.submit'
    ]
  },
  {
    name: 'Finance',
    is_protected: false,
    permissions: [
      'divisions.view',
      'work_programs.view',
      'documents.view',
      'articles.view',
      'cash.view_own',
      'cash.submit',
      'cash.manage'
    ]
  }
];

module.exports = async () => {
  try {
    console.log('📁 Seeding roles and permissions...');
    
    // Seed permissions
    const createdPermissions = {};
    for (const perm of permissions) {
      const [permission] = await Permission.findOrCreate({
        where: { slug: perm.slug },
        defaults: perm
      });
      createdPermissions[perm.slug] = permission;
    }
    
    // Seed roles and assign permissions
    for (const roleData of roles) {
      const [role] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: {
          name: roleData.name,
          is_protected: roleData.is_protected
        }
      });
      
      // Assign permissions
      if (roleData.permissions === 'ALL') {
        // Admin gets all permissions
        const allPermissions = await Permission.findAll();
        await role.setPermissions(allPermissions);
      } else {
        const rolePermissions = roleData.permissions.map(
          slug => createdPermissions[slug]
        ).filter(Boolean);
        await role.setPermissions(rolePermissions);
      }
    }
    
    console.log('✅ Roles and permissions seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error);
    throw error;
  }
};