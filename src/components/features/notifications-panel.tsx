"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { data: session } = useSession();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data: notifications, isLoading, refetch } = api.interactions.getUserNotifications.useQuery(
    {
      limit: 20,
      page: 1,
      unreadOnly: showUnreadOnly,
    },
    {
      enabled: !!session && isOpen,
      refetchOnWindowFocus: false,
    }
  );

  const { data: unreadCount } = api.interactions.getUnreadNotificationsCount.useQuery(
    undefined,
    {
      enabled: !!session,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const markAsRead = api.interactions.markNotificationAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const markAllAsRead = api.interactions.markAllNotificationsAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate({ notificationId });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return '❤️';
      case 'COMMENT':
        return '💬';
      case 'NEW_PAPER':
        return '📄';
      case 'FOLLOW':
        return '👥';
      case 'REVIEW':
        return '⭐';
      case 'MENTION':
        return '📢';
      default:
        return '🔔';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">الإشعارات</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Controls */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="mr-2"
                />
                غير المقروءة فقط
              </label>
              {unreadCount && unreadCount.count > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>
            {unreadCount && (
              <p className="text-sm text-gray-600">
                لديك {unreadCount.count} إشعار غير مقروء
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications && notifications.notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {notifications.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-500 text-lg mb-2">لا توجد إشعارات</div>
                <p className="text-gray-400">ستظهر إشعاراتك هنا</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

