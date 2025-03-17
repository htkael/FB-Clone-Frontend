import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentAPI, postAPI } from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

import {
  HeartIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import CommentItem from "./CommentItem";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(300, "Comment cannot be longer than 300 characters"),
});

const editPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(500, "Post cannot exceed 500 characters"),
});

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isAuthor = user?.id === post.author.id;

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

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors, isSubmitting: isEditSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(editPostSchema),
    mode: "onChange",
    defaultValues: {
      content: post.content,
    },
  });

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  const likeMutation = useMutation({
    mutationFn: () => postAPI.likePost(post.id),
    onSuccess: async () => {
      // Use Promise.all to ensure both queries are invalidated
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feed"] }),
        queryClient.invalidateQueries({ queryKey: ["user-posts"] }),
      ]);

      // Force refetch to ensure data is actually refreshed
      await queryClient.refetchQueries({ queryKey: ["feed"] });
      await queryClient.refetchQueries({ queryKey: ["user-posts"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (data) => postAPI.postComment(post.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      reset();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentAPI.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) => postAPI.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete post");
    },
  });

  const editPostMutation = useMutation({
    mutationFn: ({ postId, postData }) => postAPI.editPost(postId, postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      toast.success("Post updated successfully");
      setIsEditing(false);
      resetEditState();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update post");
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const onSubmit = (data) => {
    commentMutation.mutate({ content: data.content });
  };

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(post.id);
    }
  };

  const handleEditSubmit = (data) => {
    const formData = new FormData();
    formData.append("content", data.content);

    if (removeCurrentImage) {
      formData.append("removeImage", "true");
    }

    editPostMutation.mutate({
      postId: post.id,
      postData: formData,
    });
  };

  const handleRemoveImage = () => {
    setRemoveCurrentImage(true);
  };

  const resetEditState = () => {
    setRemoveCurrentImage(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setValue("content", post.content);
    resetEditState();
  };

  const queryFeed = () => {
    queryClient.invalidateQueries({ queryKey: ["feed"] });
    queryClient.invalidateQueries({ queryKey: ["user-posts"] });
  };

  const showImageInEditMode = post.imageUrl && !removeCurrentImage;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => queryFeed()}
    >
      {/* Post header */}
      <div className="p-4 flex items-center space-x-3 relative">
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

        {/* Post actions (visible on hover) */}
        {isAuthor && isHovering && !isEditing && (
          <div className="absolute top-4 right-4 flex space-x-2 bg-white dark:bg-gray-800 rounded-md shadow-sm transition-opacity duration-200">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              aria-label="Edit post"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDeletePost}
              className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              aria-label="Delete post"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Post content */}
      {isEditing ? (
        <div className="px-4 pb-3">
          <form onSubmit={handleSubmitEdit(handleEditSubmit)}>
            <div className="relative">
              <textarea
                className={`w-full border ${
                  editErrors.content
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-xl p-4 pt-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 dark:text-white transition-colors resize-none`}
                rows="3"
                {...registerEdit("content")}
              ></textarea>

              {editErrors.content && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {editErrors.content.message}
                </p>
              )}
            </div>

            {/* Image controls - only show delete option */}
            {post.imageUrl && !removeCurrentImage && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span className="text-sm">Remove Image</span>
                </button>
              </div>
            )}

            {/* Image preview in edit mode */}
            {showImageInEditMode && (
              <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="max-h-60 w-full object-contain"
                />

                {/* Overlay "Remove" button on the image */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full p-1.5 text-white transition-colors"
                  aria-label="Remove image"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            {removeCurrentImage && (
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">
                Image will be removed when you save changes
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center justify-center py-1.5 px-3 space-x-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Cancel</span>
              </button>

              <button
                type="submit"
                disabled={isEditSubmitting || editPostMutation.isLoading}
                className={`flex items-center justify-center py-1.5 px-3 space-x-1 ${
                  isEditSubmitting || editPostMutation.isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white rounded-md transition-colors`}
              >
                {isEditSubmitting || editPostMutation.isLoading ? (
                  <>
                    <span className="animate-pulse">Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Save</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="px-4 pb-3">
          <p className="text-gray-900 dark:text-white whitespace-pre-line">
            {post.content}
          </p>
        </div>
      )}

      {/* Post image (if any) */}
      {!isEditing && post.imageUrl && (
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
                  <CommentItem
                    comment={comment}
                    deleteCommentMutation={deleteCommentMutation}
                  />
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
