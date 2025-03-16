import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import ErrorFallback from "../common/ErrorFallback";
import Skeleton from "../common/Skeleton";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";

import {
  UserGroupIcon,
  UserPlusIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const FeedFriendsList = ({ userProfile }) => {
  const userId = userProfile.id;
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isOwnProfile = parseInt(currentUser?.id) === parseInt(userId);

  const { data, isLoading, error } = useQuery({
    queryKey: ["friends", userId],
    queryFn: () => userAPI.getFriendsFromUser(userId),
    select: (response) => response.data.data,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error("Error fetching user friends", error);
    },
  });

  if (error) {
    return (
      <ErrorFallback
        error={error}
        resetErrorBoundary={() => navigate("/feed")}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 h-full">
      {/* Header with icon and count */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <UserGroupIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
          Friends
          {data && data.length > 0 && (
            <span className="ml-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2.5 py-0.5">
              {data.length}
            </span>
          )}
        </h2>
        {data && data.length > 0 && (
          <Link
            to="/friends"
            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all
          </Link>
        )}
      </div>

      {/* Friends list */}
      <div className="p-0">
        {isLoading ? (
          <FriendsListSkeleton />
        ) : data?.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.slice(0, 10).map((friend) => (
              <FriendListItem
                key={friend.friend.id}
                friend={friend.friend}
                friendshipId={friend.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 mb-4">
              <UserGroupIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No friends yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {isOwnProfile
                ? "Connect with other users to start building your network."
                : `${userProfile.data.firstName} hasn't connected with anyone yet.`}
            </p>
            {isOwnProfile && (
              <Link
                to="/users"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Find Friends
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FriendListItem = ({ friend }) => {
  const fullName = [friend.firstName, friend.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      to={`/profile/${friend.id}`}
      className="block hover:bg-gray-50 dark:hover:bg-gray-750"
    >
      <div className="flex items-center p-3">
        <div className="flex-shrink-0 mr-3">
          <Avatar
            src={friend.profilePicUrl}
            alt={`${friend.firstName} ${friend.lastName}`}
            size="md"
            className="ring-2 ring-white dark:ring-gray-800"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {fullName || friend.username}
          </p>
          {fullName && (
            <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
              @{friend.username}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 ml-2">
          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
};

const FriendsListSkeleton = () => {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <Skeleton
                variant="circular"
                width="40px"
                height="40px"
                withShimmer
              />
            </div>
            <div className="flex-1">
              <Skeleton
                variant="text"
                width="70%"
                className="mb-1"
                withShimmer
              />
              <Skeleton variant="text" width="40%" withShimmer />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedFriendsList;
