import { useNotifications } from "../../context/NotificationContext";
import Badge from "../common/Badge";

const NotificationBadge = () => {
  const { unreadCount } = useNotifications();

  if (!unreadCount || unreadCount === 0) return null;

  return <Badge count={unreadCount} size="sm" />;
};

export default NotificationBadge;
