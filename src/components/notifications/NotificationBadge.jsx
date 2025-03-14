import { useNotifications } from "../../context/NotificationContext";
import Badge from "../common/Badge";

const NotificationBadge = () => {
  const { unreadCount } = useNotifications();

  if (!unreadCount || unreadCount === 0) return null;

  return (
    <Badge
      count={unreadCount}
      size="xs"
      variant="danger"
      className="animate-pulse-subtle"
    />
  );
};

export default NotificationBadge;
