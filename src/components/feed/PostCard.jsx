import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Avatar from "../common/Avatar";

// Import icons (assuming you're using heroicons)
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(300, "Comment cannot be longer than 300 characters"),
});

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(commentSchema),
    mode: "onChange",
    defaultValues: {
      content: "",
    },
  });

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => postAPI.likePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (data) => postAPI.postComment(post.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      reset();
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const onSubmit = (data) => {
    commentMutation.mutate({ content: data.content });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
      {/* Post header */}
      <div className="p-4 flex items-center space-x-3">
        <Link to={`/profile/${post.author.id}`} className="flex-shrink-0">
          <Avatar
            src={post.author.profilePicUrl}
            alt={`${post.author.firstName} ${post.author.lastName}`}
            size="md"
            className="ring-2 ring-white dark:ring-gray-800"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={`/profile/${post.author.id}`}
                className="font-medium text-gray-900 dark:text-white hover:underline"
              >
                {post.author.username}
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formattedDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Post content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 dark:text-white whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {/* Post image (if any) */}
      {post.imageUrl && (
        <div className="pb-2">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full object-cover max-h-96"
            loading="lazy"
          />
        </div>
      )}

      {/* Post stats */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
        <div className="flex items-center">
          {post.likesCount > 0 && (
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <span className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 w-5 h-5 rounded-full">
                <HeartIconSolid className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              </span>
              <span>{post.likesCount}</span>
            </div>
          )}
        </div>
        <div>
          {post.commentsCount > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-500 dark:text-gray-400 hover:underline"
            >
              {post.commentsCount}{" "}
              {post.commentsCount === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      </div>

      {/* Post actions */}
      <div className="px-2 py-1 border-t border-gray-200 dark:border-gray-700 flex justify-between">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center py-2 px-4 space-x-2 rounded-md transition-colors ${
            post.isLiked
              ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
          disabled={likeMutation.isLoading}
        >
          {post.isLiked ? (
            <HeartIconSolid className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">
            {post.isLiked ? "Liked" : "Like"}
          </span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center py-2 px-4 space-x-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Comment</span>
        </button>

        <button className="hidden sm:flex items-center justify-center py-2 px-4 space-x-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
          <ShareIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {/* Comment form with React Hook Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-start space-x-2 mb-4"
          >
            <div className="flex-shrink-0 mt-1">
              <Avatar
                src={user?.profilePicUrl}
                alt={`${user?.firstName} ${user?.lastName}`}
                size="sm"
              />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                className={`w-full border ${
                  errors.content
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 dark:text-white text-sm transition-colors`}
                placeholder="Write a comment..."
                {...register("content")}
              />
              <button
                type="submit"
                disabled={!isValid || commentMutation.isLoading}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isValid && !commentMutation.isLoading
                    ? "text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                    : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                } transition-colors`}
                aria-label="Submit comment"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
          {errors.content && (
            <p className="text-xs text-red-500 dark:text-red-400 ml-10 -mt-2 mb-3">
              {errors.content.message}
            </p>
          )}

          {/* Comments list */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <Link
                    to={`/profile/${comment.author.id}`}
                    className="flex-shrink-0 mt-1"
                  >
                    <Avatar
                      src={comment.author.profilePicUrl}
                      alt={`${comment.author.firstName} ${comment.author.lastName}`}
                      size="sm"
                    />
                  </Link>
                  <div className="flex-1 group">
                    <div className="bg-white dark:bg-gray-700 rounded-2xl px-3 py-2 shadow-sm">
                      <Link
                        to={`/profile/${comment.author.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:underline"
                      >
                        {comment.author.username}
                      </Link>
                      <p className="text-gray-800 dark:text-gray-200 text-sm break-words">
                        {comment.content}
                      </p>
                    </div>
                    <div className="ml-2 mt-1 flex items-center space-x-4 text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <ChatBubbleLeftIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
