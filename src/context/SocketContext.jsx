import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

const ENABLE_SOCKET = true;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (ENABLE_SOCKET && isAuthenticated && user) {
      try {
        const BASE_URL = import.meta.env.VITE_API_URL;
        const socketUrl = BASE_URL.replace(/\/api$/, "");
        console.log("Attempting to connect to socket server:", socketUrl);

        const socketInstance = io(socketUrl, {
          auth: {
            token: localStorage.getItem("token"),
          },
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          timeout: 10000,
        });

        socketInstance.on("connect", () => {
          console.log("Socket connected");
          console.log(socketInstance.id);
          setConnectionError(null);
        });

        socketInstance.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
          setConnectionError(err.message);
        });

        socketInstance.on("disconnect", () => {
          console.log("Socket disconnected");
        });

        socketInstance.on("user:online", (data) => {
          setOnlineUsers((prev) => ({ ...prev, [data.userId]: true }));
        });

        socketInstance.on("user:offline", (data) => {
          setOnlineUsers((prev) => {
            const updated = { ...prev };
            delete updated[data.userId];
            return updated;
          });
        });

        setSocket(socketInstance);

        return () => {
          socketInstance.disconnect();
        };
      } catch (error) {
        console.error("Socket initialization error:", error);
        setConnectionError(error.message);
      }
    }
  }, [isAuthenticated, user]);

  const joinConversation = useCallback(
    (conversationId) => {
      if (socket) {
        socket.emit("conversation:join", conversationId);
      }
    },
    [socket]
  );

  const sendTypingStatus = useCallback(
    (conversationId) => {
      if (socket) {
        socket.emit("user:typing:start", {
          conversationId,
        });
      }
    },
    [socket]
  );

  const markMessageAsRead = useCallback(
    (conversationId, messageId) => {
      if (socket) {
        socket.emit("message:read", {
          conversationId,
          lastReadMessageId: messageId,
        });
      }
    },
    [socket]
  );

  const isUserOnline = useCallback(
    (userId) => {
      // Check if userId is defined and convert to string if needed
      if (userId === undefined || userId === null) {
        return false;
      }

      // Ensure userId is a string for consistent comparison
      const userIdStr = userId.toString();

      // Check if the user is in the onlineUsers object
      return Boolean(onlineUsers[userIdStr]);
    },
    [onlineUsers]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        connectionError,
        socketEnabled: ENABLE_SOCKET,
        onlineUsers,
        joinConversation,
        sendTypingStatus,
        markMessageAsRead,
        isUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
