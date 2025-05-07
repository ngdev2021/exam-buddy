import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';
import User from './User.js';

class VoiceInteraction extends Model {}

VoiceInteraction.init({
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
  interactionType: {
    type: DataTypes.STRING,
    allowNull: false,
    // Types: 'flashcard', 'practice', 'exam', 'command'
  },
  userInput: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  systemResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  culturalVocabularyMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  culturalVocabularyType: {
    type: DataTypes.STRING,
    allowNull: true,
    // Types: 'standard', 'aave', 'southern', 'latino', 'caribbean'
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  processingTime: {
    type: DataTypes.INTEGER, // in milliseconds
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  }
}, {
  sequelize,
  modelName: 'VoiceInteraction',
  timestamps: true,
});

export default VoiceInteraction;
