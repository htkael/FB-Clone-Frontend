import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UserIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import Badge from "../common/Badge";
import { useNotifications } from "../../context/NotificationContext";

const MobileNavBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
      <div className="flex justify-around items-center h-14 xs:h-16">
        <Link
          to="/feed"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/feed")
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <HomeIcon className="w-5 h-5 xs:w-6 xs:h-6" />
          <span className="text-[10px] xs:text-xs mt-0.5 xs:mt-1">Feed</span>
        </Link>

        <Link
          to={`/profile/${user?.id}`}
          className={`flex flex-col items-center justify-center w-full h-full ${
            location.pathname.startsWith(`/profile/${user?.id}`)
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>

        <Link
          to="/messages"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/messages")
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Messages</span>
        </Link>

        <Link
          to="/users"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/users")
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <UserGroupIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Users</span>
        </Link>

        <div className="relative flex flex-col items-center justify-center w-full h-full">
          <Link
            to="#"
            className="text-gray-600 dark:text-gray-400 flex flex-col items-center relative"
            onClick={(e) => {
              e.preventDefault();
              // Toggle notifications dropdown
            }}
          >
            <div className="relative">
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2">
                  <Badge count={unreadCount} size="xs" variant="danger" />
                </span>
              )}
            </div>
            <span className="text-xs mt-1">Alerts</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileNavBar;
