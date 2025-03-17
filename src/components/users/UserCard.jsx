import { useState } from "react";
import { Link } from "react-router-dom";
import { friendAPI } from "../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import FriendButton from "../profile/FriendButton";

import {
  UserPlusIcon,
  UserIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const UserCard = ({ user, page }) => {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);
  const { isUserOnline } = useSocket();

  const isOnline = isUserOnline?.(user.id);

  const sendFriendRequestMutation = useMutation({
    mutationFn: async () => {
      const response = await friendAPI.sendRequest(user.id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", page] });
    },
    onError: (error) => {
      console.error("Friend request failed:", error);
    },
  });

  const getFriendshipStatus = () => {
    if (user.relationship?.isFriend) {
      return (
        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center">
          <CheckBadgeIcon className="w-4 h-4 mr-1" />
          Friends
        </span>
      );
    } else if (user.relationship?.friendshipStatus === "PENDING") {
      return (
        <span className="text-amber-500 dark:text-amber-400 text-sm font-medium flex items-center">
          <ClockIcon className="w-4 h-4 mr-1" />
          Request Pending
        </span>
      );
    }
    return null;
  };

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 ${
        isHovered ? "shadow-md transform scale-[1.01]" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-4">
        {/* Profile Picture */}
        <div className="relative">
          <Link to={`/profile/${user.id}`} className="flex-shrink-0">
            <Avatar
              src={user.profilePicUrl}
              alt={fullName}
              size="lg"
              isOnline={isOnline}
            />
          </Link>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <Link
              to={`/profile/${user.id}`}
              className="text-gray-900 dark:text-white font-semibold text-lg hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors"
            >
              {fullName}
            </Link>

            <div className="flex items-center mt-1">
              <span className="text-gray-500 dark:text-gray-400 text-sm truncate">
                @{user.username}
              </span>
            </div>

            {/* Friendship status with icon */}
            {getFriendshipStatus() && (
              <div className="mt-1.5">{getFriendshipStatus()}</div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-end">
        {!user.relationship?.isFriend &&
          user.relationship?.friendshipStatus !== "PENDING" && (
            <Button
              onClick={() => sendFriendRequestMutation.mutate()}
              isLoading={sendFriendRequestMutation.isLoading}
              variant="primary"
              size="sm"
              icon={<UserPlusIcon className="w-4 h-4" />}
            >
              Add Friend
            </Button>
          )}

        {/* Friend status button - shown when already friends */}
        {user.relationship?.isFriend && (
          <Link to={`/profile/${user.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              View Profile
            </Button>
          </Link>
        )}

        {/* Pending request button - shown when request is pending */}
        {user.relationship?.friendshipStatus === "PENDING" && (
          <FriendButton
            isFriend={false}
            friendshipStatus={user.relationship?.friendshipStatus}
            userId={user.id}
            page={page}
          />
        )}
      </div>
    </div>
  );
};

export default UserCard;
