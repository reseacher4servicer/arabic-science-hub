"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data: notifications, isLoading, refetch } = api.interactions.getUserNotifications.useQuery(
    {
      limit,
      page: currentPage,
      unreadOnly: showUnreadOnly,
    },
    {
      enabled: !!session,
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

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'LIKE':
        return 'إعجاب';
      case 'COMMENT':
        return 'تعليق';
      case 'NEW_PAPER':
        return 'ورقة جديدة';
      case 'FOLLOW':
        return 'متابعة';
      case 'REVIEW':
        return 'مراجعة';
      case 'MENTION':
        return 'إشارة';
      default:
        return 'إشعار';
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
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
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              يجب تسجيل الدخول لعرض الإشعارات
            </h1>
            <p className="text-gray-600 mb-6">
              قم بتسجيل الدخول لعرض إشعاراتك
            </p>
            <Link 
              href="/auth/signin"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            الإشعارات
          </h1>
          <p className="text-gray-600">
            تابع آخر التحديثات والتفاعلات على أوراقك البحثية
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="mr-2"
                />
                غير المقروءة فقط
              </label>
              {unreadCount && (
                <span className="text-sm text-gray-600">
                  لديك {unreadCount.count} إشعار غير مقروء
                </span>
              )}
            </div>
            {unreadCount && unreadCount.count > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
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
          <div className="space-y-4">
            {notifications.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'border-r-4 border-blue-500' : ''
                }`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-blue-600">
                        {getNotificationTypeText(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-900 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {showUnreadOnly ? "لا توجد إشعارات غير مقروءة" : "لا توجد إشعارات"}
            </div>
            <p className="text-gray-400 mb-6">
              {showUnreadOnly 
                ? "جميع إشعاراتك مقروءة" 
                : "ستظهر إشعاراتك هنا عند حدوث تفاعلات على أوراقك البحثية"
              }
            </p>
            {showUnreadOnly && (
              <button
                onClick={() => setShowUnreadOnly(false)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                عرض جميع الإشعارات
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {notifications && notifications.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: notifications.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

