import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useReducer,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { notificationAPI } from "../services/api";

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  loadingNotifications: false,
  error: null,
  unreadCount: 0,
  pagination: {
    page: 1,
    hasMore: false,
    totalCount: 0,
  },
};

function notificationReducer(state, action) {
  switch (action.type) {
    case "FETCH_NOTIFICATIONS_START":
      return {
        ...state,
        loadingNotifications: true,
        error: null,
      };

    case "FETCH_NOTIFICATIONS_SUCCESS":
      return {
        ...state,
        notifications:
          action.payload.page === 1
            ? action.payload.notifications
            : [...state.notifications, ...action.payload.notifications],
        pagination: {
          page: action.payload.page,
          hasMore: action.payload.hasMore,
          totalCount: action.payload.totalCount,
        },
        loadingNotifications: false,
      };

    case "FETCH_NOTIFICATIONS_ERROR":
      return {
        ...state,
        loadingNotifications: false,
        error: action.payload,
      };

    case "UPDATE_UNREAD_COUNT":
      return {
        ...state,
        unreadCount: action.payload,
      };

    case "MARK_NOTIFICATION_AS_READ": {
      const notificationIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      const markedCount = state.notifications.filter(
        (n) => notificationIds.includes(n.id) && !n.isRead
      ).length;

      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - markedCount),
      };
    }

    case "MARK_ALL_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };

    case "NEW_NOTIFICATION": {
      const isNewNotificationDuplicate = state.notifications.some(
        (n) => n.id === action.payload.id
      );

      if (isNewNotificationDuplicate) {
        return state;
      }

      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }
    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
        pagination: {
          ...state.pagination,
          page: 1,
          hasMore: false,
        },
      };

    case "SOCKET_NOTIFICATION_READ": {
      const socketReadIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      const socketMarkedCount = state.notifications.filter(
        (n) => socketReadIds.includes(n.id) && !n.isRead
      ).length;

      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          socketReadIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - socketMarkedCount),
      };
    }

    case "SOCKET_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };

    case "SOCKET_NOTIFICATIONS_CLEARED":
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
        pagination: {
          ...state.pagination,
          page: 1,
          hasMore: false,
        },
      };

    case "LOAD_MORE":
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: state.pagination.page + 1,
        },
      };

    default:
      return state;
  }
}

export const NotificationsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { socket } = useSocket();
  const user = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    dispatch({ type: "FETCH_NOTIFICATIONS_START" });
    try {
      const response = await notificationAPI.getNotifications();
      dispatch({
        type: "FETCH_NOTIFICATIONS_SUCCESS",
        payload: {
          notifications: response.data.data,
          page: response.data.meta.page,
          hasMore: response.data.meta.hasNext,
          totalCount: response.data.meta.total,
        },
      });

      dispatch({
        type: "UPDATE_UNREAD_COUNT",
        payload: response.data.meta.unreadCount,
      });
    } catch (err) {
      console.error("Error fetching notifications", err);
      dispatch({
        type: "FETCH_NOTIFICATIONS_ERROR",
        payload: err.message,
      });
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    console.log("Attempting to mark all as read");
    try {
      await notificationAPI.markNotificationsAsRead();
      dispatch({
        type: "MARK_ALL_AS_READ",
      });
      socket.emit("notification:read:all");
      dispatch({
        type: "UPDATE_UNREAD_COUNT",
        payload: 0,
      });
    } catch (err) {
      console.error("Error reading notifications", err);
      return false;
    }
  }, [socket]);

  const clearNotifications = useCallback(async () => {
    try {
      await notificationAPI.deleteNotification();
      dispatch({
        type: "CLEAR_NOTIFICATIONS",
      });
      socket.emit("notification:clear");
    } catch (err) {
      console.error("Error clearing notifications", err);
      return false;
    }
  }, [socket]);

  const getUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadNotifications();

      dispatch({
        type: "UPDATE_UNREAD_COUNT",
        payload: response.data.data.count,
      });
    } catch (err) {
      console.error("Error getting unread count", err);
      return false;
    }
  }, []);

  const loadMoreNotifications = useCallback(async () => {
    dispatch({
      type: "LOAD_MORE",
    });
    const pagination = state.pagination;
    if (!pagination || !pagination.hasNext) return false;
    const nextPage = pagination.page + 1;
    try {
      dispatch({ type: "FETCH_NOTIFICATIONS_START" });
      const response = await notificationAPI.getNotifications({
        page: nextPage,
      });
      dispatch({
        type: "FETCH_NOTIFICATIONS_SUCCESS",
        payload: {
          notifications: response.data.data,
          page: response.data.meta.page,
          hasMore: response.data.meta.hasNext,
          totalCount: response.data.meta.total,
        },
      });

      return true;
    } catch (err) {
      console.error("Error loading more notifications", err);
      return false;
    }
  }, [state.pagination]);

  const handleNewNotification = useCallback(async (notification) => {
    dispatch({
      type: "NEW_NOTIFICATION",
      payload: notification,
    });
  }, []);

  const setupSocketListeners = useCallback(() => {
    if (!socket || !user) return;

    socket.on("notification:new", (notification) => {
      console.log("Receiving new notification", notification);
      handleNewNotification(notification);
    });

    socket.on("notification:read:all", () => {
      dispatch({
        type: "SOCKET_ALL_READ",
      });
    });

    socket.on("notification:clear", () => {
      dispatch({
        type: "SOCKET_NOTIFICATIONS_CLEARED",
      });
    });

    return () => {
      socket.off("notification:new");
      socket.off("notification:read");
      socket.off("notification:read:all");
      socket.off("notification:clear");
    };
  }, [socket, user, handleNewNotification]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      getUnreadCount();
      const cleanup = setupSocketListeners();

      return () => {
        cleanup && cleanup();
      };
    }
  }, [user, fetchNotifications, getUnreadCount, setupSocketListeners]);

  const value = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loadingNotifications,
    error: state.error,
    pagination: state.pagination,
    fetchNotifications,
    markAllAsRead,
    clearNotifications,
    loadMoreNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};
