import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import ErrorFallback from "../common/ErrorFallback";
import Avatar from "../common/Avatar";
import Skeleton from "../common/Skeleton";
import { useAuth } from "../../context/AuthContext";

// Import icons (assuming you're using heroicons)
import {
  UserGroupIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

const FriendsList = ({ userProfile }) => {
  const userId = userProfile.data.id;
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header with icon and count */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <UserGroupIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
          Friends
          {data && data.length > 0 && (
            <span className="ml-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2.5 py-0.5">
              {data.length}
            </span>
          )}
        </h2>
      </div>

      {/* Friends grid */}
      <div className="p-4">
        {isLoading ? (
          <FriendsGridSkeleton />
        ) : data?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((friend) => (
              <FriendCard
                key={friend.friend.id}
                friend={friend.friend}
                friendshipId={friend.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
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

const FriendCard = ({ friend, friendshipId }) => {
  const fullName = [friend.firstName, friend.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all hover:shadow-md group">
      <Link to={`/profile/${friend.id}`} className="block">
        <div className="w-full aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
          {friend.profilePicUrl ? (
            <img
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              src={friend.profilePicUrl}
              alt={`${friend.username}`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white text-3xl font-medium">
              {friend.username.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Optional hover overlay effect */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
        </div>
      </Link>

      <div className="p-3">
        <Link
          to={`/profile/${friend.id}`}
          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block truncate transition-colors"
        >
          {fullName || friend.username}
        </Link>
        {fullName && (
          <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
            @{friend.username}
          </p>
        )}
      </div>
    </div>
  );
};

const FriendsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <div className="w-full aspect-square">
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              withShimmer
            />
          </div>
          <div className="p-3">
            <Skeleton variant="text" width="80%" className="mb-2" withShimmer />
            <Skeleton variant="text" width="50%" withShimmer />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendsList;
