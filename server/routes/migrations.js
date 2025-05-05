import express from "express";
import sequelize from "../models/index.js";
import { DataTypes } from 'sequelize';

const router = express.Router();

// POST /api/migrations/add-current-subject
router.post("/add-current-subject", async (req, res) => {
  try {
    console.log('Starting migration to add currentSubject column to Users table...');
    
    // Check if the column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Users' AND column_name='currentSubject';
    `;
    
    const [checkResults] = await sequelize.query(checkColumnQuery);
    
    if (checkResults.length === 0) {
      console.log('Column currentSubject does not exist. Adding it now...');
      
      // Add the column with a default value
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN "currentSubject" VARCHAR(255) NOT NULL DEFAULT 'Insurance Exam';
      `);
      
      console.log('Successfully added currentSubject column to Users table');
      res.json({ success: true, message: 'Successfully added currentSubject column to Users table' });
    } else {
      console.log('Column currentSubject already exists. No changes needed.');
      res.json({ success: true, message: 'Column currentSubject already exists. No changes needed.' });
    }
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
