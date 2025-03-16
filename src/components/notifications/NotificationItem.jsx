import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";

// Import icons
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  UserIcon,
  EnvelopeIcon,
  BellIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

const NotificationItem = ({ notification }) => {
  const { type, content, createdAt, fromUser, isRead, link } = notification;

  // Get the appropriate icon and color based on notification type
  const getIconDetails = () => {
    switch (type) {
      case "LIKE":
        return {
          icon: HeartIcon,
          color: "text-red-500 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-900/30",
        };
      case "COMMENT":
        return {
          icon: ChatBubbleLeftIcon,
          color: "text-blue-500 dark:text-blue-400",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
        };
      case "FRIEND_REQUEST":
        return {
          icon: UserPlusIcon,
          color: "text-green-500 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/30",
        };
      case "friend_accepted":
        return {
          icon: UserIcon,
          color: "text-green-500 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/30",
        };
      case "message":
        return {
          icon: EnvelopeIcon,
          color: "text-purple-500 dark:text-purple-400",
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
        };
      default:
        return {
          icon: BellIcon,
          color: "text-gray-500 dark:text-gray-400",
          bgColor: "bg-gray-100 dark:bg-gray-700",
        };
    }
  };

  const { icon: IconComponent, color, bgColor } = getIconDetails();

  // Format the time
  const formattedTime = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
  });

  // Generate appropriate destination link
  const getDestinationLink = () => {
    // If link is provided directly, use it
    if (link) return link;

    // Otherwise, determine by type
    switch (type) {
      case "FRIEND_REQUEST":
      case "FRIEND_ACCEPTED":
        // Direct to user profile if available
        return fromUser ? `/profile/${fromUser.id}` : "#";
      case "MESSAGE":
        // Direct to messages with this user if available
        return fromUser ? `/messages/${fromUser.id}` : "/messages";
      default:
        return "#";
    }
  };

  const destinationLink = getDestinationLink();

  return (
    <Link
      to={destinationLink}
      className={`flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
        !isRead
          ? "bg-blue-50 dark:bg-blue-900/10 border-l-2 border-blue-500 dark:border-blue-400"
          : ""
      }`}
    >
      {/* User avatar */}
      {fromUser && (
        <div className="flex-shrink-0 mr-3">
          <Avatar
            src={fromUser.profilePicUrl}
            alt={fromUser.username}
            size="md"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Text content */}
        <p className="text-sm text-gray-800 dark:text-gray-200 pr-2">
          {content}
        </p>

        {/* Time */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
          <ClockIcon className="w-3 h-3 mr-1" />
          {formattedTime}
        </div>
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 ml-2 p-2 rounded-full ${bgColor}`}>
        <IconComponent className={`w-4 h-4 ${color}`} />
      </div>
    </Link>
  );
};

export default NotificationItem;
