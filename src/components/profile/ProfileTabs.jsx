import React from "react";
import {
  DocumentTextIcon,
  UserIcon,
  UserGroupIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "posts", label: "Posts", icon: DocumentTextIcon },
    { id: "about", label: "About", icon: UserIcon },
    { id: "friends", label: "Friends", icon: UserGroupIcon },
    { id: "likes", label: "Likes", icon: HeartIcon },
  ];
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user.id;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    // If switching to the friends tab, add the query parameter
    if (tabId === "friends") {
      navigate(`/profile/${userId}?tab=friends`, { replace: true });
    } else if (tabId === "about") {
      navigate(`/profile/${userId}?tab=about`, { replace: true });
    } else if (tabId === "likes") {
      navigate(`/profile/${userId}?tab=likes`, { replace: true });
    }
    // For any other tab, remove the query parameter by navigating to the base URL
    else {
      navigate(`/profile/${userId}`, { replace: true });
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <nav className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center justify-center px-6 py-4 font-medium text-sm transition-colors focus:outline-none focus:ring-inset focus:ring-blue-500 flex-1 ${
                isActive
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <Icon
                className={`w-4 h-4 mr-2 ${
                  isActive
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ProfileTabs;
