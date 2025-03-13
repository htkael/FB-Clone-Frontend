import { useCallback, useEffect, useRef, useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

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
      className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 max-h-96 overflow-y-auto"
    >
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-medium">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear All
          </button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No notifications</div>
      ) : (
        <>
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

          {(loading || isLoadingMore) && pagination?.hasMore && (
            <div className="p-2 text-center text-gray-500">
              <span className="inline-block animate-spin mr-2">⟳</span>
              Loading more...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
