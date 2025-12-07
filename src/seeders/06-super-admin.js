const { User, Role, Division, UserRole } = require('../models');

module.exports = async () => {
  try {
    console.log('\ud83d\udc51 Seeding super admin user...');

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME;

    if (!email || !password || !name) {
      console.warn('ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME tidak diset. Melewati seeding Super Admin.');
      return;
    }

    const role = await Role.findOne({ where: { name: 'ADMIN' } });
    if (!role) {
      console.warn('Role ADMIN tidak ditemukan. Melewati seeding Super Admin.');
      return;
    }

    const division = await Division.findOne({ where: { name: 'Executive' } });
    if (!division) {
      console.warn('Divisi Executive tidak ditemukan. Melewati seeding Super Admin.');
      return;
    }

    let bcryptLib;
    try { bcryptLib = require('bcrypt'); } catch (e) {
      try { bcryptLib = require('bcryptjs'); } catch (e2) { bcryptLib = null; }
    }

    let hashedPassword = password;
    if (bcryptLib) {
      const saltRounds = 10;
      hashedPassword = await bcryptLib.hash(password, saltRounds);
    } else {
      console.warn('bcrypt/bcryptjs tidak tersedia; password tidak di-hash. Login mungkin gagal.');
    }

    const defaults = { name, email, password: hashedPassword };
    const hasPosition = User.rawAttributes && User.rawAttributes.position;
    if (hasPosition) defaults.position = 'P';

    let divisionFk = null;
    if (User.rawAttributes && User.rawAttributes.division_id) divisionFk = 'division_id';
    else if (User.rawAttributes && User.rawAttributes.divisionId) divisionFk = 'divisionId';
    if (divisionFk) defaults[divisionFk] = division.id;

    const [user] = await User.findOrCreate({
      where: { email },
      defaults
    });

    let userIdKey = 'user_id';
    let roleIdKey = 'role_id';
    if (!(UserRole.rawAttributes && UserRole.rawAttributes[userIdKey])) {
      if (UserRole.rawAttributes && UserRole.rawAttributes.userId) userIdKey = 'userId';
    }
    if (!(UserRole.rawAttributes && UserRole.rawAttributes[roleIdKey])) {
      if (UserRole.rawAttributes && UserRole.rawAttributes.roleId) roleIdKey = 'roleId';
    }

    await UserRole.findOrCreate({
      where: { [userIdKey]: user.id, [roleIdKey]: role.id },
      defaults: { [userIdKey]: user.id, [roleIdKey]: role.id }
    });

    console.log('\u2705 Super admin user berhasil di-seed');
  } catch (err) {
    console.error('\u274c Error seeding super admin:', err);
    throw err;
  }
};