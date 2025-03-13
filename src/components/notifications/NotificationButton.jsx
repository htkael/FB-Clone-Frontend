import { useState } from "react";
import { BsBell, BsBellFill } from "react-icons/bs";
import NotificationBadge from "./NotificationBadge";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "../../context/NotificationContext";

const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-200 focus:outline-none"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BsBellFill className="w-6 h-6 text-blue-600" />
        ) : (
          <BsBell className="w-6 h-6" />
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
