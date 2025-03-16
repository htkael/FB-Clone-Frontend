import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import ErrorFallback from "../common/ErrorFallback";
import PostCard from "../../components/feed/PostCard";
import { useAuth } from "../../context/AuthContext";
import { useCallback } from "react";
import Skeleton from "../common/Skeleton";

import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

const Likes = ({ userProfile }) => {
  const userId = userProfile.data.id;
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["likes", userId],
    queryFn: () => userAPI.getLikesFromUser(userId),
    select: (response) => response.data.data,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error("Error fetching user likes", error);
    },
  });

  const formatPostForDisplay = useCallback(
    (post) => {
      if (!post) return null;

      const isLiked =
        post.likes?.some(
          (like) => like.user?.id === parseInt(currentUser?.id)
        ) || false;

      return {
        ...post,
        isLiked,
        likesCount: post.likes?.length || post._count?.likes || 0,
        commentsCount: post.comments?.length || post._count?.comments || 0,
      };
    },
    [currentUser?.id]
  );

  const displayPosts = data
    ? data
        .map((like) => {
          if (like.post) {
            return {
              ...formatPostForDisplay(like.post),
              likeId: like.id,
            };
          }
          return null;
        })
        .filter((post) => post !== null)
    : [];

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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <HeartIconSolid className="w-5 h-5 mr-2 text-red-500 dark:text-red-400" />
          Liked Posts
          {data && data.length > 0 && (
            <span className="ml-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2.5 py-0.5">
              {data.length}
            </span>
          )}
        </h2>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton.Card hasHeader={true} withShimmer />
            <Skeleton.Card hasHeader={true} hasImage={true} withShimmer />
            <Skeleton.Card hasHeader={true} withShimmer />
          </div>
        ) : displayPosts.length > 0 ? (
          <div className="space-y-0 divide-y divide-gray-200 dark:divide-gray-700">
            {displayPosts.map((post) => (
              <div key={post.id || post.likeId} className="p-4">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 mb-4">
              <HeartIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No liked posts yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {userId === parseInt(currentUser?.id)
                ? "Posts you like will appear here. Find posts you enjoy and give them some love!"
                : `${userProfile.data.firstName} hasn't liked any posts yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Likes;
