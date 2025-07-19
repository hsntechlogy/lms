import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { userData, enrolledCourses } = useContext(AppContext);

  // Mock notifications - in a real app, these would come from an API
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'new_lecture',
        title: 'New Lecture Available',
        message: 'New lecture "Advanced JavaScript Concepts" added to JavaScript Course',
        courseId: 'course1',
        courseTitle: 'JavaScript Fundamentals',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false
      },
      {
        id: 2,
        type: 'course_update',
        title: 'Course Updated',
        message: 'React Course has been updated with new content and exercises',
        courseId: 'course2',
        courseTitle: 'React Development',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isRead: false
      },
      {
        id: 3,
        type: 'live_class',
        title: 'Live Class Reminder',
        message: 'Live class "Web Development Q&A" starts in 30 minutes',
        courseId: 'course3',
        courseTitle: 'Web Development',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: true
      },
      {
        id: 4,
        type: 'achievement',
        title: 'Achievement Unlocked',
        message: 'Congratulations! You completed "JavaScript Fundamentals" course',
        courseId: 'course1',
        courseTitle: 'JavaScript Fundamentals',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: true
      },
      {
        id: 5,
        type: 'new_course',
        title: 'New Course Available',
        message: 'New course "Python for Data Science" is now available',
        courseId: 'course4',
        courseTitle: 'Python for Data Science',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRead: true
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_lecture':
        return assets.play_icon;
      case 'course_update':
        return assets.add_icon;
      case 'live_class':
        return assets.zoom_icon;
      case 'achievement':
        return assets.blue_tick_icon;
      case 'new_course':
        return assets.course_1;
      default:
        return assets.notification_icon;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_lecture':
        return 'text-blue-600';
      case 'course_update':
        return 'text-green-600';
      case 'live_class':
        return 'text-purple-600';
      case 'achievement':
        return 'text-yellow-600';
      case 'new_course':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'new_lecture':
      case 'course_update':
        // Navigate to course details
        break;
      case 'live_class':
        // Navigate to live classes
        break;
      case 'achievement':
        // Show achievement modal or navigate to profile
        break;
      case 'new_course':
        // Navigate to course details
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <img src={assets.notification_icon} alt="Notifications" className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <img src={assets.notification_icon} alt="No notifications" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={getNotificationIcon(notification.type)}
                        alt={notification.type}
                        className={`w-5 h-5 mt-1 ${getNotificationColor(notification.type)}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-semibold text-gray-800 truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.courseTitle && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              {notification.courseTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Link
                to="/notifications"
                className="text-sm text-blue-600 hover:text-blue-800 text-center block"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationDropdown; 