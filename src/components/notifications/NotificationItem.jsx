import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faUserPlus,
  faUserCheck,
  faEnvelope,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import Avatar from "../common/Avatar";

const NotificationItem = ({ notification }) => {
  const { type, content, createdAt, fromUser, isRead } = notification;

  const getIcon = () => {
    switch (type) {
      case "post_like":
        return <FontAwesomeIcon icon={faHeart} className="text-red-500" />;
      case "post_comment":
        return <FontAwesomeIcon icon={faComment} className="text-blue-500" />;
      case "friend_request":
        return <FontAwesomeIcon icon={faUserPlus} className="text-green-500" />;
      case "friend_accepted":
        return (
          <FontAwesomeIcon icon={faUserCheck} className="text-green-500" />
        );
      case "message":
        return (
          <FontAwesomeIcon icon={faEnvelope} className="text-purple-500" />
        );
      default:
        return <FontAwesomeIcon icon={faBell} className="text-gray-500" />;
    }
  };

  return (
    <div
      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
        !isRead ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start">
        {/* Profile picture */}
        {fromUser && (
          <Link to={`/profile/${fromUser.id}`} className="flex-shrink-0">
            <Avatar src={fromUser.profilePicUrl} alt={fromUser.username} />
          </Link>
        )}

        <div className="flex-grow">
          {/* Content */}
          <div className="text-sm">{content}</div>

          {/* Time */}
          <div className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </div>
        </div>

        {/* Icon */}
        <div className="flex-shrink-0 ml-2">{getIcon()}</div>
      </div>
    </div>
  );
};

export default NotificationItem;
