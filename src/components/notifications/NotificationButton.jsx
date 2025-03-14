import { useState } from "react";
import NotificationBadge from "./NotificationBadge";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "../../context/NotificationContext";
import { BellIcon, BellAlertIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";

const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
        onClick={toggleDropdown}
        aria-label="Notifications"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <BellAlertIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
        <div className="absolute -top-1 -right-1">
          <NotificationBadge />
        </div>
      </button>

      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default NotificationButton;
