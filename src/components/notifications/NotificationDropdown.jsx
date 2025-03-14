import { useCallback, useEffect, useRef, useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

// Import icons
import {
  BellIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const {
    notifications,
    loading,
    unreadCount,
    markAllAsRead,
    clearNotifications,
    loadMoreNotifications,
    pagination,
  } = useNotifications();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const dropdownRef = useRef();

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  useOnClickOutside(dropdownRef, onClose);

  const observer = useRef(null);

  const lastNotificationRef = useCallback(
    (node) => {
      if (loading || isLoadingMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting && pagination?.hasMore) {
            setIsLoadingMore(true);
            await loadMoreNotifications();
            setIsLoadingMore(false);
          }
        },
        { threshold: 0.5 }
      );
      if (node) observer.current.observe(node);
    },
    [pagination?.hasMore, loading, isLoadingMore, loadMoreNotifications]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-20 overflow-hidden border border-gray-200 dark:border-gray-700 max-h-[28rem] flex flex-col"
      style={{ maxHeight: "calc(100vh - 100px)" }}
    >
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10">
        <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
          <BellIcon className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
          Notifications
        </h3>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 py-1 px-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
            aria-label="Clear all notifications"
            title="Clear all notifications"
          >
            <TrashIcon className="w-3.5 h-3.5 mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 h-40">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full mb-2"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 h-40">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 mb-3">
              <BellIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">
              No notifications
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((notification, index) => {
              // Apply the ref to the last notification item
              if (index === notifications.length - 1) {
                return (
                  <div ref={lastNotificationRef} key={notification.id}>
                    <NotificationItem notification={notification} />
                  </div>
                );
              }
              return (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Loading more indicator */}
      {(loading || isLoadingMore) && pagination?.hasMore && (
        <div className="p-3 text-center text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center space-x-2">
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading more...</span>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
