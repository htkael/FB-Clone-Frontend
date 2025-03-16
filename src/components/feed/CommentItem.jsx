import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentAPI } from "../../services/api";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(300, "Comment cannot be longer than 300 characters"),
});

const CommentItem = ({ comment, deleteCommentMutation }) => {
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isOwnComment = comment.author.id === parseInt(user?.id);
  const timeoutRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm({
    resolver: zodResolver(commentSchema),
    mode: "onChange",
    defaultValues: {
      content: comment.content,
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: (data) => commentAPI.editComment(comment.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      setIsEditing(false);
    },
  });

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowOptions(true);
    }, 50);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowOptions(false);
    }, 200);
  }, []);

  const startEditing = () => {
    setValue("content", comment.content);
    setIsEditing(true);
    setShowOptions(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleEditSubmit = (data) => {
    editCommentMutation.mutate({ content: data.content });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(comment.id);
    }
  };

  return (
    <div
      className="flex items-start space-x-2 w-full"
      onMouseEnter={() => handleMouseEnter()}
      onMouseLeave={() => handleMouseLeave()}
    >
      <Link to={`/profile/${comment.author.id}`} className="flex-shrink-0 mt-1">
        <Avatar
          src={comment.author.profilePicUrl}
          alt={comment.author.username}
          size="sm"
        />
      </Link>
      <div className="flex-1 group relative">
        {isEditing ? (
          <div className="bg-gray-50 dark:bg-gray-700/60 rounded-2xl p-2 shadow-sm">
            <form onSubmit={handleSubmit(handleEditSubmit)}>
              <div className="relative">
                <textarea
                  className={`w-full border ${
                    errors.content
                      ? "border-red-300 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 dark:text-white text-sm transition-colors resize-none`}
                  rows="2"
                  placeholder="Edit your comment..."
                  {...register("content")}
                ></textarea>

                {errors.content && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.content.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Cancel"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  disabled={!isValid || editCommentMutation.isLoading}
                  className={`p-1.5 rounded-full transition-colors ${
                    isValid && !editCommentMutation.isLoading
                      ? "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                      : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  }`}
                  title="Save changes"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
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
          </>
        )}

        {isOwnComment && showOptions && !isEditing && (
          <div className="absolute right-1 xs:right-2 top-1 xs:top-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-0.5 xs:p-1 z-10 flex">
            <button
              className="p-1 xs:p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 mr-0.5"
              onClick={startEditing}
              aria-label="Edit comment"
              title="Edit comment"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              className="p-1 xs:p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleDelete}
              aria-label="Delete comment"
              title="Delete comment"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
