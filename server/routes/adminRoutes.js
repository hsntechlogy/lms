import express from 'express';
import { getAllUsers, getUserStats } from '../controllers/adminController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const adminRouter = express.Router();

// Admin routes - all protected with admin middleware
adminRouter.get('/users', protectAdmin, getAllUsers);
adminRouter.get('/stats', protectAdmin, getUserStats);

export default adminRouter; 