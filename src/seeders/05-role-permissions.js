const { Role, Permission } = require('../models');

const rolePermissionsMap = {
  ADMIN: 'ALL',
  MEMBER: [
    'divisions.view',
    'work_programs.view',
    'documents.view',
    'articles.view',
    'cash.view_own',
    'cash.submit'
  ],
  HR: [
    'users.view',
    'users.manage',
    'divisions.view',
    'work_programs.view',
    'documents.view',
    'articles.view',
    'cash.view_own',
    'cash.submit'
  ],
  Secretary: [
    'divisions.view',
    'work_programs.view',
    'documents.view',
    'documents.manage',
    'articles.view',
    'cash.view_own',
    'cash.submit'
  ],
  Media: [
    'divisions.view',
    'work_programs.view',
    'documents.view',
    'articles.view',
    'articles.manage',
    'cash.view_own',
    'cash.submit'
  ],
  Finance: [
    'divisions.view',
    'work_programs.view',
    'documents.view',
    'articles.view',
    'cash.view_own',
    'cash.submit',
    'cash.manage'
  ]
};

module.exports = async () => {
  try {
    console.log('\ud83d\udd12 Seeding role-permissions mapping...');

    const allPermissions = await Permission.findAll();
    const permsBySlug = allPermissions.reduce((acc, p) => { acc[p.slug] = p; return acc; }, {});

    for (const [roleName, slugs] of Object.entries(rolePermissionsMap)) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        console.warn(`Role ${roleName} not found, skipping.`);
        continue;
      }

      if (slugs === 'ALL') {
        await role.setPermissions(allPermissions);
      } else {
        const rolePerms = slugs.map((s) => permsBySlug[s]).filter(Boolean);
        await role.setPermissions(rolePerms);
      }
    }

    console.log('\u2705 Role-permissions mapping completed');
  } catch (error) {
    console.error('\u274c Error seeding role-permissions:', error);
    throw error;
  }
};