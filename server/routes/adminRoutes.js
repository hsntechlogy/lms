import express from 'express';
import { getAllUsers, getUserStats, getManualPayments, verifyPayment } from '../controllers/adminController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const adminRouter = express.Router();

// Admin routes - all protected with admin middleware
adminRouter.get('/users', protectAdmin, getAllUsers);
adminRouter.get('/stats', protectAdmin, getUserStats);
adminRouter.get('/manual-payments', protectAdmin, getManualPayments);
adminRouter.post('/verify-payment', protectAdmin, verifyPayment);

export default adminRouter; 