// src/components/layout/Sidebar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  UserCircleIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const { user, logout } = useAuth();

  // Sidebar navigation items
  const navigation = [
    { name: "Feed", href: "/feed", icon: HomeIcon },
    {
      name: "Profile",
      href: `/profile/${user?.username}`,
      icon: UserCircleIcon,
    },
    { name: "Friends", href: "/friends", icon: UsersIcon },
    { name: "Messages", href: "/messages", icon: ChatBubbleLeftRightIcon },
    { name: "Notifications", href: "/notifications", icon: BellIcon },
    { name: "Settings", href: "/settings", icon: CogIcon },
  ];

  return (
    <div className="h-screen flex flex-col border-r border-gray-200 bg-white w-64 hidden md:flex">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex-1 flex flex-col space-y-1 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <item.icon
                className="mr-3 h-6 w-6 text-gray-500 group-hover:text-gray-900"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* User info and logout */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div>
            {user?.profilePicUrl ? (
              <img
                className="inline-block h-10 w-10 rounded-full"
                src={user.profilePicUrl}
                alt={`${user.firstName} ${user.lastName}`}
              />
            ) : (
              <div className="inline-block h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </p>
            <button
              onClick={logout}
              className="text-xs font-medium text-gray-500 group flex items-center hover:text-gray-700 mt-1"
            >
              <ArrowLeftOnRectangleIcon
                className="mr-2 h-4 w-4 text-gray-400 group-hover:text-gray-500"
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
