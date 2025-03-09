import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

// Set to false during development if you're having CORS issues
const ENABLE_SOCKET = true;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
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
          setConnectionError(null);
        });

        socketInstance.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
          setConnectionError(err.message);
        });

        socketInstance.on("disconnect", () => {
          console.log("Socket disconnected");
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

  return (
    <SocketContext.Provider
      value={{ socket, connectionError, socketEnabled: ENABLE_SOCKET }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
