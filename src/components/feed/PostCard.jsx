import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (data) => postAPI.postComment(post.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Post header */}
      <div className="p-4 flex items-center space-x-3">
        <Link to={`/profile/${post.author.id}`} className="flex-shrink-0">
          {post.author.profilePicUrl ? (
            <img
              className="h-10 w-10 rounded-full"
              src={post.author.profilePicUrl}
              alt={`${post.author.firstName} ${post.author.lastName}`}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {post.author.username.charAt(0)}
            </div>
          )}
        </Link>
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

      {/* Post content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 dark:text-white">{post.content}</p>
      </div>

      {/* Post image (if any) */}
      {post.imageUrl && (
        <div className="pb-3">
          <img src={post.imageUrl} alt="Post" className="w-full" />
        </div>
      )}

      {/* Post stats */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm text-gray-500 dark:text-gray-400">
        <div>
          {post.likesCount > 0 && (
            <span>
              {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}
            </span>
          )}
        </div>
        <div>
          {post.commentsCount > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:underline"
            >
              {post.commentsCount}{" "}
              {post.commentsCount === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      </div>

      {/* Post actions */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center w-1/2 py-2 space-x-2 rounded-md ${
            post.isLiked
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
          disabled={likeMutation.isLoading}
        >
          <svg
            className="h-5 w-5"
            fill={post.isLiked ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>{post.isLiked ? "Liked" : "Like"}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center w-1/2 py-2 space-x-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>Comment</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          {/* Comment form with React Hook Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-center space-x-2 mb-4"
          >
            <div className="flex-shrink-0">
              {user?.profilePicUrl ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.profilePicUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                className={`w-full border ${
                  errors.content ? "border-red-300" : "border-gray-300"
                } dark:border-gray-600 rounded-full p-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white`}
                placeholder="Write a comment..."
                {...register("content")}
              />
              <button
                type="submit"
                disabled={!isValid || commentMutation.isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 disabled:text-gray-400"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
          {errors.content && (
            <p className="text-sm text-red-500 ml-10 mb-2">
              {errors.content.message}
            </p>
          )}

          {/* Comments list */}
          <div className="space-y-3">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <Link
                    to={`/profile/${comment.author.id}`}
                    className="flex-shrink-0"
                  >
                    {comment.author.profilePicUrl ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={comment.author.profilePicUrl}
                        alt={`${comment.author.firstName} ${comment.author.lastName}`}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {comment.author.username.charAt(0)}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
                      <Link
                        to={`/profile/${comment.author.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:underline"
                      >
                        {comment.author.username}
                      </Link>
                      <p className="text-gray-800 dark:text-gray-200">
                        {comment.content}
                      </p>
                    </div>
                    <div className="ml-2 mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-2">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
