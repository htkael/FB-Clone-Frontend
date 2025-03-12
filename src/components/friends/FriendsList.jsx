import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import ErrorFallback from "../common/ErrorFallback";
import { FiUsers } from "react-icons/fi";

const FriendsList = ({ userProfile }) => {
  const userId = userProfile.data.id;
  const navigate = useNavigate();

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Simple header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <FiUsers className="mr-2" />
          Friends {data && `(${data.length})`}
        </h2>
      </div>

      {/* Friends grid */}
      <div className="p-4">
        {isLoading ? (
          <FriendsGridSkeleton />
        ) : data?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((friend) => (
              <FriendCard
                key={friend.friend.id}
                friend={friend.friend}
                friendshipId={friend.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-5xl mb-4">👥</div>
            <p className="text-gray-600 font-medium">No friends yet</p>
            <p className="text-gray-500 mt-1">
              Friends you connect with will appear here
            </p>
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/profile/${friend.id}`} className="block">
        <div className="w-full h-40 bg-gray-200">
          {friend.profilePicUrl ? (
            <img
              className="w-full h-full object-cover"
              src={friend.profilePicUrl}
              alt={`${friend.username}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white text-3xl font-medium">
              {friend.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link
          to={`/profile/${friend.id}`}
          className="font-medium text-gray-900 hover:underline block truncate"
        >
          {fullName || friend.username}
        </Link>
        {fullName && (
          <p className="text-gray-500 text-sm truncate">@{friend.username}</p>
        )}
      </div>
    </div>
  );
};

const FriendsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="w-full h-40 bg-gray-200 animate-pulse" />
          <div className="p-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendsList;
