import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useReducer,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { messageAPI, conversationAPI } from "../services/api";

const MessagingContext = createContext();

const intitialState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  loadingConversations: false,
  loadingMessages: false,
  error: null,
  unreadCounts: {},
  typingUsers: {},
  messagePagination: {},
};

function messagingReducer(state, action) {
  switch (action.type) {
    case "FETCH_CONVERSATIONS_START":
      return { ...state, loadingConversations: true, error: null };
    case "FETCH_CONVERSATIONS_SUCCESS":
      return {
        ...state,
        conversations: action.payload,
        loadingConversations: false,
      };
    case "FETCH_CONVERSATIONS_ERROR":
      return { ...state, loadingConversations: false, error: action.payload };
    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversation: action.payload };
    case "FETCH_MESSAGES_START":
      return { ...state, loadingMessages: true };
    case "FETCH_MESSAGES_SUCCESS":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages,
        },
        messagePagination: {
          ...state.messagePagination,
          [action.payload.conversationId]: action.payload.pagination,
        },
        loadingMessages: false,
        error: false,
      };
    case "FETCH_MESSAGES_ERROR":
      return { ...state, loadingMessages: false, error: action.payload };
    case "ADD_MESSAGE": {
      const conversationId = action.payload.message.conversationId;
      const currentMessages = state.messages[conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [action.payload.message, ...currentMessages],
        },
      };
    }
    case "UPDATE_MESSAGE": {
      const updatedConvId = action.payload.message.conversationId;
      const messageId = action.payload.message.id;
      const updatedMessages = state.messages[updatedConvId]
        ? state.messages[updatedConvId].map((msg) =>
            msg.id === messageId ? action.payload.message : msg
          )
        : [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [updatedConvId]: updatedMessages,
        },
      };
    }
    case "DELETE_MESSAGE": {
      const deleteConvId = action.payload.conversationId;
      const filteredMessages = state.messages[deleteConvId]
        ? state.messages[deleteConvId].filter(
            (msg) => msg.id !== action.payload.messageId
          )
        : [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [deleteConvId]: filteredMessages,
        },
      };
    }
    case "USER_TYPING": {
      const typingConvId = action.payload.conversationId;
      const currentTypingUsers = state.typingUsers[typingConvId] || {};
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [typingConvId]: {
            ...currentTypingUsers,
            [action.payload.userId]: {
              username: action.payload.username,
              timestamp: action.payload.timestamp,
            },
          },
        },
      };
    }
    case "USER_STOPPED_TYPING": {
      const stoppedConvId = action.payload.conversationId;
      const updatedTypingUsers = { ...state.typingUsers };
      if (updatedTypingUsers[stoppedConvId]) {
        const { [action.payload.userId]: _, ...rest } =
          updatedTypingUsers[stoppedConvId];
        updatedTypingUsers[stoppedConvId] = rest;
      }
      return {
        ...state,
        typingUsers: updatedTypingUsers,
      };
    }
    case "UPDATE_UNREAD_COUNT":
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.conversationId]: action.payload.count,
        },
      };
    case "ADD_CONVERSATION":
      if (state.conversations.some((conv) => conv.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };
    case "UPDATE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.id ? action.payload : conv
        ),
        activeConversation:
          state.activeConversation?.id === action.payload.id
            ? action.payload
            : state.activeConversation,
      };
    case "MARK_MESSAGES_AS_READ": {
      const convId = action.payload.conversationId;
      const currentUserId = action.payload.currentUserId;
      return {
        ...state,
        messages: {
          ...state.messages,
          [convId]:
            state.messages[convId]?.map((msg) => ({
              ...msg,
              isRead: msg.senderId !== currentUserId ? true : msg.isRead,
            })) || [],
        },
      };
    }
    default:
      return state;
  }
}

export const MessagingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messagingReducer, intitialState);
  const { socket, joinConversation } = useSocket();
  const { user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    dispatch({ type: "FETCH_CONVERSATIONS_START" });
    try {
      const response = await conversationAPI.getConversations();
      dispatch({
        type: "FETCH_CONVERSATIONS_SUCCESS",
        payload: response.data.data,
      });

      const unreadResponse = await conversationAPI.getUnread();

      unreadResponse.data.data.conversations.forEach((unread) => {
        dispatch({
          type: "UPDATE_UNREAD_COUNT",
          payload: {
            conversationId: unread.conversationId,
            count: unread.unreadCount,
          },
        });
      });
    } catch (err) {
      console.error("Error fetching conversations:", err);
      dispatch({
        type: "FETCH_CONVERSATIONS_ERROR",
        payload: err.message,
      });
    }
  }, [user]);

  const fetchConversation = useCallback(
    async (conversationId, page = 1, limit = 30) => {
      dispatch({ type: "FETCH_MESSAGES_START" });
      try {
        const response = await conversationAPI.getConversation(
          conversationId,
          page,
          limit
        );
        const conversationData = response.data.data;

        // Update the conversation in the state
        dispatch({
          type: "UPDATE_CONVERSATION",
          payload: conversationData,
        });

        // Store messages separately for easier access
        dispatch({
          type: "FETCH_MESSAGES_SUCCESS",
          payload: {
            conversationId,
            messages: conversationData.messages || [],
            pagination: response.data.meta,
          },
        });

        return conversationData;
      } catch (error) {
        console.error("Error fetching conversation:", error);
        return null;
      }
    },
    []
  );

  const loadMoreMessages = useCallback(
    async (conversationId) => {
      dispatch({ type: "FETCH_MESSAGES_START" });
      const pagination = state.messagePagination[conversationId];
      if (!pagination || !pagination.hasNext) return false;
      const nextPage = pagination.page + 1;
      try {
        const response = await conversationAPI.getConversation(conversationId, {
          page: nextPage,
        });
        const newMessages = response.data.data.messages || [];
        const currentMessages = state.messages[conversationId] || [];

        dispatch({
          type: "FETCH_MESSAGES_SUCCESS",
          payload: {
            conversationId,
            messages: [...currentMessages, ...newMessages],
            pagination: response.data.meta,
          },
        });
        return true;
      } catch (err) {
        console.error("Error loading more messages", err);
        return false;
      }
    },
    [state.messagePagination, state.messages]
  );

  const setActiveConversation = useCallback(
    async (conversation) => {
      dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: conversation });

      if (conversation) {
        joinConversation(conversation.id);

        try {
          await conversationAPI.markConversationAsRead(conversation.id);

          if (socket) {
            socket.emit("message:read", {
              conversationId: conversation.id,
              userId: parseInt(user.id),
            });
          }

          dispatch({
            type: "MARK_MESSAGES_AS_READ",
            payload: {
              conversationId: conversation.id,
              currentUserId: parseInt(user?.id),
            },
          });

          dispatch({
            type: "UPDATE_UNREAD_COUNT",
            payload: { conversationId: conversation.id, count: 0 },
          });

          fetchConversation(conversation.id);
        } catch (err) {
          console.error("Error marking conversation as read:", err);
        }
      }
    },
    [joinConversation, fetchConversation, user?.id, socket]
  );

  const startConversation = useCallback(
    async (options) => {
      try {
        let participantIds = [];
        let title = null;
        let isGroup = false;

        if (typeof options === "object") {
          participantIds = options.participantIds || [];
          title = options.title;
          isGroup = options.isGroup || false;
        } else {
          // Legacy support for single recipient ID
          participantIds = [options];
        }

        if (participantIds.length === 0) {
          console.error("No participants specified");
          return null;
        }

        if (isGroup && !title) {
          console.error("Group conversations require a title");
          return null;
        }

        // For direct messages, check if conversation already exists
        if (!isGroup && participantIds.length === 1) {
          const recipientId = participantIds[0];
          const existingConv = state.conversations.find((conv) => {
            if (conv.isGroup) return false; // Skip group conversations

            return conv.participants.some(
              (p) => p.user && p.user.id === parseInt(recipientId)
            );
          });

          if (existingConv) {
            setActiveConversation(existingConv);
            return existingConv;
          }
        }

        // Validate group chat requirements
        if (isGroup && !title) {
          console.error("Group conversations require a title");
          return null;
        }

        // Create new conversation
        const payload = {
          participants: participantIds,
          isGroup,
        };

        // Add title for group chats
        if (isGroup) {
          payload.title = title;
        }

        console.log("Creating conversation with payload:", payload);

        const response = await conversationAPI.createConversation(payload);
        const newConversation = response.data.data;

        // Add to state
        dispatch({
          type: "ADD_CONVERSATION",
          payload: newConversation,
        });

        // Set as active
        setActiveConversation(newConversation);

        return newConversation;
      } catch (error) {
        console.error("Error starting conversation:", error);
        return null;
      }
    },
    [state.conversations, setActiveConversation]
  );

  const sendMessage = useCallback(async (conversationId, content) => {
    try {
      const response = await messageAPI.sendMessage(conversationId, content);

      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          message: response.data.content,
        },
      });
      return response.data.content;
    } catch (err) {
      console.error("Error sending message:", err);
      return null;
    }
  }, []);

  const editMessage = useCallback(
    async (conversationId, messageId, content) => {
      try {
        const response = await messageAPI.editMessage(
          conversationId,
          messageId,
          { content }
        );

        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            message: response.data.data,
          },
        });

        return response.data.data;
      } catch (error) {
        console.error("Error editing message:", error);
        return null;
      }
    },
    []
  );

  const deleteMessage = useCallback(async (conversationId, messageId) => {
    try {
      await messageAPI.deleteMessage(conversationId, messageId);

      dispatch({
        type: "DELETE_MESSAGE",
        payload: {
          conversationId,
          messageId,
        },
      });

      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (data) => {
      const isConversationActive =
        state.activeConversation?.id === data.message.conversationId;

      const isFromCurrentUser = data.message.senderId === parseInt(user?.id);

      const isRead = isConversationActive && !isFromCurrentUser;

      const messageWithReadStatus = {
        ...data.message,
        isRead: isRead,
      };
      console.log(
        `Recieved new message. Active?: ${isConversationActive}. isRead?: ${isRead}`
      );

      dispatch({
        type: "ADD_MESSAGE",
        payload: { message: messageWithReadStatus },
      });

      if (
        isConversationActive &&
        data.message.senderId !== parseInt(user?.id)
      ) {
        await conversationAPI.markConversationAsRead(
          data.message.conversationId
        );
        if (socket) {
          socket.emit("message:read", {
            conversationId: data.message.conversationId,
            userId: parseInt(user.id),
          });
        }
      } else if (!isConversationActive) {
        const currentCount =
          state.unreadCounts[data.message.conversationId] || 0;
        dispatch({
          type: "UPDATE_UNREAD_COUNT",
          payload: {
            conversationId: data.message.conversationId,
            count: currentCount + 1,
          },
        });
      }

      fetchConversations();
    };

    const handleMessageRead = (data) => {
      const { conversationId, userId } = data;

      if (userId !== parseInt(user?.id)) {
        dispatch({
          type: "MARK_MESSAGES_AS_READ",
          payload: { conversationId },
        });
      }
    };

    const handleMessageUpdated = (data) => {
      dispatch({
        type: "UPDATE_MESSAGE",
        payload: { message: data.message },
      });
    };

    const handleMessageDeleted = (data) => {
      dispatch({
        type: "DELETE_MESSAGE",
        payload: {
          messageId: data.messageId,
          conversationId: data.conversationId,
        },
      });
    };

    const handleUserTyping = (data) => {
      // Don't show typing indicator for own messages
      if (data.userId === parseInt(user.id)) return;

      dispatch({
        type: "USER_TYPING",
        payload: data,
      });
    };

    const handleUserStoppedTyping = (data) => {
      if (data.userId === parseInt(user.id)) return;

      dispatch({
        type: "USER_STOPPED_TYPING",
        payload: data,
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:updated", handleMessageUpdated);
    socket.on("message:deleted", handleMessageDeleted);
    socket.on("user:typing", handleUserTyping);
    socket.on("user:typing:stop", handleUserStoppedTyping);
    socket.on("message:read", handleMessageRead);

    // Cleanup event listeners
    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:updated", handleMessageUpdated);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("user:typing", handleUserTyping);
      socket.off("user:typing:stop", handleUserStoppedTyping);
      socket.off("message:read", handleMessageRead);
    };
  }, [
    socket,
    state.activeConversation,
    state.unreadCounts,
    user,
    fetchConversations,
  ]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const getTotalUnreadCount = useCallback(() => {
    return Object.values(state.unreadCounts).reduce(
      (total, count) => total + count,
      0
    );
  }, [state.unreadCounts]);

  return (
    <MessagingContext.Provider
      value={{
        conversations: state.conversations,
        activeConversation: state.activeConversation,
        messages: state.messages,
        loadingConversations: state.loadingConversations,
        loadingMessages: state.loadingMessages,
        error: state.error,
        unreadCounts: state.unreadCounts,
        typingUsers: state.typingUsers,
        messagePagination: state.messagePagination,
        fetchConversations,
        fetchConversation,
        loadMoreMessages,
        setActiveConversation,
        startConversation,
        sendMessage,
        editMessage,
        deleteMessage,
        getTotalUnreadCount,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => useContext(MessagingContext);
