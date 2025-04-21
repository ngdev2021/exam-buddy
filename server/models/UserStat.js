import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';

class UserStat extends Model {}

UserStat.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  correct: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  incorrect: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'UserStat',
  timestamps: true,
  hooks: {
    afterCreate: (stat, options) => {
      console.log('UserStat created:', stat.id, stat.userId, stat.topic);
    },
    afterUpdate: (stat, options) => {
      console.log('UserStat updated:', stat.id, stat.userId, stat.topic);
    },
    afterDestroy: (stat, options) => {
      console.log('UserStat deleted:', stat.id, stat.userId, stat.topic);
    },
    afterFind: (result, options) => {
      console.log('UserStat(s) found:', Array.isArray(result) ? result.map(s => s.id) : result?.id);
    },
    afterBulkCreate: (stats, options) => {
      console.log('Bulk UserStats created:', stats.length);
    },
    afterBulkUpdate: (options) => {
      console.log('Bulk UserStats updated');
    },
    afterBulkDestroy: (options) => {
      console.log('Bulk UserStats deleted');
    }
  }
});

User.hasMany(UserStat, { foreignKey: 'userId' });
UserStat.belongsTo(User, { foreignKey: 'userId' });

export default UserStat;
