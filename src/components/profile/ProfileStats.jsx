import React from "react";
import { DocumentTextIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const ProfileStats = ({ postCount, friendCount }) => {
  return (
    <div className="flex flex-wrap justify-start gap-6 mt-5 text-center">
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
        <DocumentTextIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" />
        <div className="flex flex-col items-start">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {postCount}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Posts
          </span>
        </div>
      </div>

      <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
        <UserGroupIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" />
        <div className="flex flex-col items-start">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {friendCount}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Friends
          </span>
        </div>
      </div>

      {/* You can easily add more stats here */}
      {/* 
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
        <HeartIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" />
        <div className="flex flex-col items-start">
          <span className="text-xl font-bold text-gray-900 dark:text-white">142</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Likes</span>
        </div>
      </div>
      */}
    </div>
  );
};

export default ProfileStats;
