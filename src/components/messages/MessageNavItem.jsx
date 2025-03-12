import { Link } from "react-router-dom";
import { useMessaging } from "../../context/MessagingContext";
import Badge from "../common/Badge";
import { FiMessageSquare } from "react-icons/fi";

const MessageNavItem = ({ className = "" }) => {
  const { getTotalUnreadCount } = useMessaging();
  const unreadCount = getTotalUnreadCount();
  return (
    <Link
      to="/messages"
      className={`relative flex items-center p-2 hover:bg-gray-100 rounded-md ${className}`}
    >
      <FiMessageSquare className="h-6 w-6 text-gray-700" />
      {unreadCount > 0 && (
        <Badge
          count={unreadCount}
          size="sm"
          className="absolute -top-1 -right-1"
        />
      )}
    </Link>
  );
};

export default MessageNavItem;
