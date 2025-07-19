import express from 'express';
import { 
  getUserNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../controllers/notificationController.js';
import { protectUser } from '../middlewares/authMiddleware.js';

const notificationRouter = express.Router();

// All routes are protected with user authentication
notificationRouter.use(protectUser);

// Get user notifications with pagination and filtering
notificationRouter.get('/', getUserNotifications);

// Get unread notification count
notificationRouter.get('/unread-count', getUnreadCount);

// Mark specific notification as read
notificationRouter.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
notificationRouter.patch('/mark-all-read', markAllAsRead);

// Delete a notification
notificationRouter.delete('/:notificationId', deleteNotification);

export default notificationRouter; 