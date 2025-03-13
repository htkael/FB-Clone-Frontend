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
        payload: response.data.data,
      });

      const unread = response.data.data.filter((r) => {
        r.isRead === "false";
      });
      dispatch({
        type: "UPDATE_UNREAD_COUNT",
        payload: unread.length,
      });
    } catch (err) {
      console.error("Error fetching notifications", err);
      dispatch({
        type: "FETCH_NOTIFICATIONS_ERROR",
        payload: err.message,
      });
    }
  }, [user]);
};
