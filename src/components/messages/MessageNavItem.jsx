import { Link } from "react-router-dom";
import { useMessaging } from "../../context/MessagingContext";
import Badge from "../common/Badge";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const MessageNavItem = ({ className = "" }) => {
  const { getTotalUnreadCount } = useMessaging();
  const unreadCount = getTotalUnreadCount();

  return (
    <Link
      to="/messages"
      className={`relative flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${className}`}
      aria-label="Messages"
      title="Messages"
    >
      <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      {unreadCount > 0 && (
        <Badge
          count={unreadCount}
          size="xs"
          variant="danger"
          className="absolute -top-1 -right-1"
        />
      )}
    </Link>
  );
};

export default MessageNavItem;
