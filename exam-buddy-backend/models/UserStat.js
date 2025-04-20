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
});

User.hasMany(UserStat, { foreignKey: 'userId' });
UserStat.belongsTo(User, { foreignKey: 'userId' });

export default UserStat;
