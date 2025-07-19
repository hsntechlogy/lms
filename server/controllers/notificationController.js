import Course from '../models/course.js';
import Notification from '../models/Notification.js';
import User from '../models/Users.js';

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { page = 1, limit = 20, type, isRead } = req.query;

    const query = { userId };
    
    if (type) {
      query.type = type;
    }
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('courseId', 'courseTitle courseThumbnail');

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      notifications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.auth.userId;
    
    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.auth.userId;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// Create notification (for internal use)
export const createNotification = async (userId, notificationData) => {
  try {
    console.log('Saving notification for user:', userId, notificationData);
    const notification = new Notification({
      userId,
      ...notificationData
    });
    await notification.save();
    console.log('Notification saved for user:', userId);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create notification for new lecture
export const createLectureNotification = async (courseId, lectureTitle) => {
  try {
    const course = await Course.findById(courseId).populate('enrolledStudents');
    
    if (!course) {
      throw new Error('Course not found');
    }

    const notificationPromises = course.enrolledStudents.map(student => 
      createNotification(student._id.toString(), {
        type: 'new_lecture',
        title: 'New Lecture Available',
        message: `New lecture "${lectureTitle}" has been added to ${course.courseTitle}`,
        courseId: course._id,
        courseTitle: course.courseTitle
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating lecture notification:', error);
  }
};

// Create notification for course update
export const createCourseUpdateNotification = async (courseId, updateMessage) => {
  try {
    const course = await Course.findById(courseId).populate('enrolledStudents');
    
    if (!course) {
      throw new Error('Course not found');
    }

    const notificationPromises = course.enrolledStudents.map(student => 
      createNotification(student._id.toString(), {
        type: 'course_update',
        title: 'Course Updated',
        message: `${course.courseTitle} has been updated: ${updateMessage}`,
        courseId: course._id,
        courseTitle: course.courseTitle
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating course update notification:', error);
  }
};

// Create notification for live class
export const createLiveClassNotification = async (courseId, classTitle, scheduledTime) => {
  try {
    const course = await Course.findById(courseId).populate('enrolledStudents');
    
    if (!course) {
      throw new Error('Course not found');
    }

    const notificationPromises = course.enrolledStudents.map(student => 
      createNotification(student._id.toString(), {
        type: 'live_class',
        title: 'Live Class Scheduled',
        message: `Live class "${classTitle}" is scheduled for ${scheduledTime}`,
        courseId: course._id,
        courseTitle: course.courseTitle,
        metadata: { scheduledTime }
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating live class notification:', error);
  }
};

// Create notification for course completion
export const createCourseCompletionNotification = async (userId, courseId) => {
  try {
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    await createNotification(userId, {
      type: 'achievement',
      title: 'Course Completed!',
      message: `Congratulations! You have successfully completed "${course.courseTitle}"`,
      courseId: course._id,
      courseTitle: course.courseTitle
    });
  } catch (error) {
    console.error('Error creating course completion notification:', error);
  }
};

// Create notification for payment success
export const createPaymentSuccessNotification = async (userId, courseId) => {
  try {
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    await createNotification(userId, {
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your payment for "${course.courseTitle}" was successful. You can now access the course.`,
      courseId: course._id,
      courseTitle: course.courseTitle
    });
  } catch (error) {
    console.error('Error creating payment success notification:', error);
  }
};

// Create notification for new course
export const createNewCourseNotification = async (courseId) => {
  try {
    console.log('createNewCourseNotification called for course:', courseId);
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    // Get all users who might be interested in new courses
    const users = await User.find({});
    console.log('Notifying users:', users.map(u => u._id));
    
    const notificationPromises = users.map(user => {
      console.log('Creating notification for user:', user._id);
      return createNotification(user._id.toString(), {
        type: 'new_course',
        title: 'New Course Available',
        message: `New course "${course.courseTitle}" is now available for enrollment`,
        courseId: course._id,
        courseTitle: course.courseTitle
      });
    });

    await Promise.all(notificationPromises);
    console.log('All notifications created for new course:', courseId);
  } catch (error) {
    console.error('Error creating new course notification:', error);
  }
}; 