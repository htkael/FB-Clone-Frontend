import { useState } from "react";
import { postAPI } from "../../services/api";
import toast from "react-hot-toast";

const LikeButton = ({ post, user, queryClient }) => {
  const isLiked = post.likes?.some((like) => like.userId === user?.id);
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdating) return;

    setIsUpdating(true);
    // Optimistically update UI
    setOptimisticLiked(!optimisticLiked);

    try {
      // Make API call
      await postAPI.likePost(post.id);

      // Wait a moment before invalidating queries
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force manual refetch of affected queries
      await queryClient.refetchQueries({
        queryKey: ["feed"],
        type: "all",
      });

      await queryClient.refetchQueries({
        queryKey: ["user-posts"],
        type: "all",
      });
    } catch (error) {
      console.error(error);
      setOptimisticLiked(isLiked);
      toast.error("Failed to update like status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center justify-center py-2 px-4 space-x-2 rounded-md transition-colors ${
        optimisticLiked
          ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
      disabled={isUpdating}
    >
      {optimisticLiked ? (
        <HeartIconSolid className="h-5 w-5" />
      ) : (
        <HeartIcon className="h-5 w-5" />
      )}
      <span className="text-sm font-medium">
        {optimisticLiked ? "Liked" : "Like"}
      </span>
    </button>
  );
};

export default LikeButton;
