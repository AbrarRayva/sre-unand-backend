const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.TEXT, allowNull: false, unique: true },
  name: { type: DataTypes.TEXT, allowNull: false },
  password: { type: DataTypes.TEXT, allowNull: false },
  position: { type: DataTypes.ENUM('P','VP','SEC','DIRECTOR','MANAGER','STAFF'), allowNull: false },
  division_id: { type: DataTypes.BIGINT, allowNull: true },
  sub_division_id: { type: DataTypes.BIGINT, allowNull: true }
}, { tableName: 'users', timestamps: false, scopes: { withPassword: { attributes: { include: ['password'] } } } });

User.prototype.comparePassword = async function(plainPassword) {
  if (!this.password) return false;
  try {
    return await bcrypt.compare(plainPassword, this.password);
  } catch (err) {
    return false;
  }
};

User.addHook('beforeCreate', async (user) => {
  if (user.email) {
    user.email = user.email.trim().toLowerCase();
  }
  if (user.password) {
    const isHashed = typeof user.password === 'string' && user.password.startsWith('$2');
    if (!isHashed) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
  }
});

User.addHook('beforeUpdate', async (user) => {
  if (user.email) {
    user.email = user.email.trim().toLowerCase();
  }
  if (user.changed('password')) {
    const isHashed = typeof user.password === 'string' && user.password.startsWith('$2');
    if (!isHashed) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
  }
});

module.exports = User;