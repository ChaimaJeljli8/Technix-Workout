import React, { useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuth';

const NotificationCenter = () => {
  const {
    notifications,
    fetchNotifications,
    markNotificationAsRead,
    clearReadNotifications
  } = useAuthStore();

  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'signup':
        return <Bell className="text-blue-500" size={20} />;
      case 'login':
        return <Check className="text-green-500" size={20} />;
      case 'error':
        return <X className="text-red-500" size={20} />;
      case 'update':
        return <Bell className="text-yellow-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'signup':
        return 'bg-blue-50';
      case 'login':
        return 'bg-green-50';
      case 'add':
        return 'bg-red-50';
      case 'update':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-lg shadow-lg p-7 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-teal-700">Notifications</h2>
        <button
          onClick={clearReadNotifications}
          className="text-sm px-3 py-1 border rounded-md hover:bg-gray-100"
        >
          Clear Read
        </button>
      </div>

      <div className="space-y-2">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg ${getNotificationColor(notification.type)} ${
                notification.read ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{notification.title}</h3>
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className={`text-xs ${
                        notification.read ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'
                      }`}
                    >
                      {notification.read ? 'Read' : 'Mark as read'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <span className="text-xs text-gray-500">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No notifications</p>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;