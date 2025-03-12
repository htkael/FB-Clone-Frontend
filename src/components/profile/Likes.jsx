import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import ErrorFallback from "../common/ErrorFallback";
import PostCard from "../../components/feed/PostCard";
import { useAuth } from "../../context/AuthContext";
import { useCallback } from "react";

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
  console.log("data", data);

  const formatPostForDisplay = useCallback(
    (post) => {
      if (!post) return null;

      // Safely check for likes array
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

  // Only process data if it exists
  const displayPosts = data
    ? data
        .map((like) => {
          // Check if the like has a post property
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Liked Posts {data && `(${data.length})`}
        </h2>
      </div>

      <div className="p-4">
        {isLoading ? (
          <PostsSkeleton count={3} />
        ) : displayPosts.length > 0 ? (
          <div className="space-y-4">
            {displayPosts.map((post) => (
              <PostCard key={post.id || post.likeId} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No liked posts</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PostsSkeleton = ({ count }) => (
  <>
    {Array(count)
      .fill(0)
      .map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 animate-pulse"
        >
          <div className="flex items-center mb-4">
            <div className="bg-gray-200 h-10 w-10 rounded-full mr-3"></div>
            <div>
              <div className="bg-gray-200 h-4 w-32 rounded mb-1"></div>
              <div className="bg-gray-200 h-3 w-24 rounded"></div>
            </div>
          </div>
          <div className="bg-gray-200 h-24 rounded mb-4"></div>
          <div className="flex justify-between">
            <div className="bg-gray-200 h-8 w-16 rounded"></div>
            <div className="bg-gray-200 h-8 w-16 rounded"></div>
          </div>
        </div>
      ))}
  </>
);

export default Likes;
