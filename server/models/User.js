import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';

class User extends Model {}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'User',
  timestamps: true,
  hooks: {
    afterCreate: (user, options) => {
      console.log('User created:', user.id, user.email);
    },
    afterUpdate: (user, options) => {
      console.log('User updated:', user.id, user.email);
    },
    afterDestroy: (user, options) => {
      console.log('User deleted:', user.id, user.email);
    },
    afterFind: (result, options) => {
      console.log('User(s) found:', Array.isArray(result) ? result.map(u => u.id) : result?.id);
    },
    afterBulkCreate: (users, options) => {
      console.log('Bulk users created:', users.length);
    },
    afterBulkUpdate: (options) => {
      console.log('Bulk users updated');
    },
    afterBulkDestroy: (options) => {
      console.log('Bulk users deleted');
    }
  }
});

export default User;
