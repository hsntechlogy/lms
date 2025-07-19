import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import Footer from '../../components/students/Footer';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();

  // Mock notifications - in a real app, these would come from an API
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'new_lecture',
        title: 'New Lecture Available',
        message: 'New lecture "Advanced JavaScript Concepts" added to JavaScript Course. This lecture covers advanced topics like closures, prototypes, and ES6 features.',
        courseId: 'course1',
        courseTitle: 'JavaScript Fundamentals',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false
      },
      {
        id: 2,
        type: 'course_update',
        title: 'Course Updated',
        message: 'React Course has been updated with new content and exercises. New modules on React Hooks and Context API have been added.',
        courseId: 'course2',
        courseTitle: 'React Development',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isRead: false
      },
      {
        id: 3,
        type: 'live_class',
        title: 'Live Class Reminder',
        message: 'Live class "Web Development Q&A" starts in 30 minutes. Join us for an interactive session with industry experts.',
        courseId: 'course3',
        courseTitle: 'Web Development',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: true
      },
      {
        id: 4,
        type: 'achievement',
        title: 'Achievement Unlocked',
        message: 'Congratulations! You completed "JavaScript Fundamentals" course with distinction. You earned a certificate and 100 points.',
        courseId: 'course1',
        courseTitle: 'JavaScript Fundamentals',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: true
      },
      {
        id: 5,
        type: 'new_course',
        title: 'New Course Available',
        message: 'New course "Python for Data Science" is now available. Learn data analysis, machine learning, and visualization with Python.',
        courseId: 'course4',
        courseTitle: 'Python for Data Science',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRead: true
      },
      {
        id: 6,
        type: 'live_class',
        title: 'Live Class Scheduled',
        message: 'New live class "Advanced React Patterns" scheduled for tomorrow at 2 PM. Don\'t miss this opportunity to learn from experts.',
        courseId: 'course2',
        courseTitle: 'React Development',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        isRead: true
      },
      {
        id: 7,
        type: 'course_update',
        title: 'Course Content Updated',
        message: 'Node.js course has been updated with new practical exercises and real-world projects.',
        courseId: 'course5',
        courseTitle: 'Node.js Backend',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        isRead: true
      }
    ];

    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = notifications;
    
    switch (filter) {
      case 'unread':
        filtered = notifications.filter(n => !n.isRead);
        break;
      case 'new_lecture':
        filtered = notifications.filter(n => n.type === 'new_lecture');
        break;
      case 'course_update':
        filtered = notifications.filter(n => n.type === 'course_update');
        break;
      case 'live_class':
        filtered = notifications.filter(n => n.type === 'live_class');
        break;
      case 'achievement':
        filtered = notifications.filter(n => n.type === 'achievement');
        break;
      case 'new_course':
        filtered = notifications.filter(n => n.type === 'new_course');
        break;
      default:
        filtered = notifications;
    }
    
    setFilteredNotifications(filtered);
  }, [filter, notifications]);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
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
        return 'text-blue-600 bg-blue-50';
      case 'course_update':
        return 'text-green-600 bg-green-50';
      case 'live_class':
        return 'text-purple-600 bg-purple-50';
      case 'achievement':
        return 'text-yellow-600 bg-yellow-50';
      case 'new_course':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'new_lecture':
        return 'New Lecture';
      case 'course_update':
        return 'Course Update';
      case 'live_class':
        return 'Live Class';
      case 'achievement':
        return 'Achievement';
      case 'new_course':
        return 'New Course';
      default:
        return 'Notification';
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
        navigate(`/course/${notification.courseId}`);
        break;
      case 'live_class':
        navigate('/live-classes');
        break;
      case 'achievement':
        // Show achievement modal or navigate to profile
        toast.success('Achievement unlocked!');
        break;
      case 'new_course':
        navigate(`/course/${notification.courseId}`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="relative md:px-36 px-8 pt-20 text-left">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Notifications</h1>
              <p className="text-gray-600">
                <span
                  className="text-blue-600 cursor-pointer"
                  onClick={() => navigate('/')}
                >
                  Home
                </span>{' '}
                / <span>Notifications</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
              { key: 'new_lecture', label: 'New Lectures', count: notifications.filter(n => n.type === 'new_lecture').length },
              { key: 'course_update', label: 'Updates', count: notifications.filter(n => n.type === 'course_update').length },
              { key: 'live_class', label: 'Live Classes', count: notifications.filter(n => n.type === 'live_class').length },
              { key: 'achievement', label: 'Achievements', count: notifications.filter(n => n.type === 'achievement').length },
              { key: 'new_course', label: 'New Courses', count: notifications.filter(n => n.type === 'new_course').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <img src={assets.notification_icon} alt="No notifications" className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {filter === 'all' ? 'You\'re all caught up!' : `No ${filter.replace('_', ' ')} notifications`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg border p-6 transition-all hover:shadow-md ${
                    !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                        <img
                          src={getNotificationIcon(notification.type)}
                          alt={notification.type}
                          className="w-6 h-6"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                                New
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full ${getNotificationColor(notification.type)}`}>
                              {getTypeLabel(notification.type)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.courseTitle && (
                                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                  {notification.courseTitle}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleNotificationClick(notification)}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Notifications; 