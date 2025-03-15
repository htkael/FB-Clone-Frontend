import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";

const CommentItem = ({ comment, deleteCommentMutation }) => {
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  const isOwnComment = comment.author.id === parseInt(user?.id);
  const timeoutRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a slight delay to ensure hover is intentional
    timeoutRef.current = setTimeout(() => {
      setShowOptions(true);
    }, 50);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Add a slight delay before hiding to prevent accidental mouse-out
    timeoutRef.current = setTimeout(() => {
      setShowOptions(false);
    }, 200);
  }, []);

  return (
    <div
      className="flex items-start space-x-2"
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

        {/* Delete button - only shown for user's own comments */}
        {isOwnComment && showOptions && (
          <div className="absolute right-1 xs:right-2 top-1 xs:top-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-0.5 xs:p-1 z-10">
            <button
              className="p-1 xs:p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this comment?"
                  )
                ) {
                  deleteCommentMutation.mutate(comment.id);
                }
              }}
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
