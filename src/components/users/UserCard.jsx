import { useState } from "react";
import { Link } from "react-router-dom";
import { friendAPI } from "../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../../context/SocketContext";

const UserCard = ({ user, page }) => {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);
  const { isUserOnline } = useSocket();

  // Handle friend request sending
  const sendFriendRequestMutation = useMutation({
    mutationFn: async () => {
      console.log("Attempting to send friend request to user ID:", user.id);
      const response = await friendAPI.sendRequest(user.id);
      console.log("Friend request response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("Friend request successful:", data);
      queryClient.invalidateQueries({ queryKey: ["users", page] });
    },
    onError: (error) => {
      console.error("Friend request failed:", error);
    },
  });

  const getFriendshipStatus = () => {
    if (user.relationship?.isFriend) {
      return (
        <span className=" text-blue-500 text-sm font-medium">Friends</span>
      );
    } else if (user.relationship?.friendshipStatus === "PENDING") {
      return (
        <span className=" text-yellow-500 text-sm font-medium">
          Request Pending
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-all duration-200 ${
        isHovered ? "shadow-md transform scale-[1.01]" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-4">
        {/* Profile Picture */}
        <div className="relative">
          <Link to={`/profile/${user.id}`} className="flex-shrink-0">
            {user.profilePicUrl ? (
              <img
                src={user.profilePicUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold">
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </div>
            )}
          </Link>
          {isUserOnline(user.id) ? (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
          ) : (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <Link
              to={`/profile/${user.id}`}
              className="text-gray-900 dark:text-white font-medium text-lg hover:underline"
            >
              {user.firstName} {user.lastName}
            </Link>

            <div className="flex items-center mt-1">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                @{user.username}
              </span>
            </div>

            {/* Move friendship status to its own line */}
            {getFriendshipStatus() && (
              <div className="mt-1">{getFriendshipStatus()}</div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-end">
        {!user.relationship?.isFriend &&
          user.relationship?.friendshipStatus !== "PENDING" && (
            <button
              onClick={() => sendFriendRequestMutation.mutate()}
              disabled={sendFriendRequestMutation.isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-70"
            >
              {sendFriendRequestMutation.isLoading ? (
                "Sending..."
              ) : (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Add Friend
                </span>
              )}
            </button>
          )}
      </div>
    </div>
  );
};

export default UserCard;
