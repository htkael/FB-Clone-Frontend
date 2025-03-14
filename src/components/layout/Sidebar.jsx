import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  UserCircleIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Sidebar navigation items
  const navigation = [
    { name: "Feed", href: "/feed", icon: HomeIcon },
    {
      name: "Profile",
      href: `/profile/${user?.id}`,
      icon: UserCircleIcon,
    },
    {
      name: "Friends",
      href: `/profile/${user.id}?tab=friends`,
      icon: UsersIcon,
    },
    { name: "Messages", href: "/messages", icon: ChatBubbleLeftRightIcon },
    { name: "Users", href: "/users", icon: UsersIcon },
  ];

  // Check if the current path matches a navigation item
  const isActive = (href) => {
    if (href === "/feed" && location.pathname === "/feed") return true;

    // Handle profile path specifically
    if (
      href.startsWith(`/profile/${user?.id}`) &&
      location.pathname.startsWith(`/profile/${user?.id}`)
    ) {
      // Check if both have the same query parameter or both don't have it
      if (href.includes("?tab=") && location.pathname.includes("?tab=")) {
        return href.split("?tab=")[1] === location.pathname.split("?tab=")[1];
      }
      if (!href.includes("?tab=") && !location.pathname.includes("?tab=")) {
        return true;
      }
      return false;
    }

    return location.pathname === href;
  };

  return (
    <div className="sticky top-16 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-64 hidden md:flex h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex-1 flex flex-col space-y-1 px-3">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    active
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      {/* User info and logout */}
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <div>
            {user?.profilePicUrl ? (
              <img
                className="inline-block h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                src={user.profilePicUrl}
                alt={`${user.firstName} ${user.lastName}`}
              />
            ) : (
              <div className="inline-block h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {user?.firstName} {user?.lastName}
            </p>
            <button
              onClick={logout}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 group flex items-center hover:text-gray-700 dark:hover:text-gray-200 mt-1 transition-colors"
            >
              <ArrowLeftOnRectangleIcon
                className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors"
                aria-hidden="true"
              />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
