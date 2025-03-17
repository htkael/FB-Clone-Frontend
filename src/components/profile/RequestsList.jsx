import { useQuery } from "@tanstack/react-query";

import { Link, useNavigate } from "react-router-dom";
import ErrorFallback from "../common/ErrorFallback";
import Skeleton from "../common/Skeleton";

import Avatar from "../common/Avatar";
import { friendAPI } from "../../services/api";
import FriendButton from "./FriendButton";
import { useAuth } from "../../context/AuthContext";

import {
  UserGroupIcon,
  UserPlusIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const RequestsList = ({ userProfile }) => {
  const userId = userProfile.data.id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["requests", userId],
    queryFn: () => friendAPI.getRequests(),
    select: (response) => response.data,
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
          Requests
          {data && data.data.length > 0 && (
            <span className="ml-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2.5 py-0.5">
              {data.data.length}
            </span>
          )}
        </h2>
      </div>

      {/* Friends list */}
      <div className="p-0">
        {isLoading ? (
          <FriendsListSkeleton />
        ) : data?.data.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.data.map((friend) => (
              <div
                key={
                  user.id === friend.user.id ? friend.friend.id : friend.user.id
                }
                className="grid grid-cols-2 gap-4 items-center "
              >
                <FriendListItem
                  key={
                    user.id === friend.user.id
                      ? friend.friend.id
                      : friend.user.id
                  }
                  friend={
                    user.id === friend.user.id ? friend.friend : friend.user
                  }
                  friendshipId={friend.id}
                />
                <div className="p-2 grid  items-center justify-items-center ">
                  <FriendButton
                    isFriend={false}
                    friendshipStatus={friend.status}
                    userId={
                      user.id === friend.user.id
                        ? friend.friend.id
                        : friend.user.id
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 mb-4">
              <UserGroupIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No requests
            </h3>
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

export default RequestsList;
