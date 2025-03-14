import { useRef, useEffect, useState, useCallback } from "react";
import { useMessaging } from "../../context/MessagingContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import { format } from "date-fns";

// Import icons
import {
  PaperAirplaneIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  UserGroupIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const MessageThread = () => {
  const {
    activeConversation,
    messages,
    sendMessage,
    typingUsers,
    messagePagination,
    loadMoreMessages,
    loadingMessages,
    editMessage,
    deleteMessage,
  } = useMessaging();

  const { user } = useAuth();
  const { sendTypingStatus, isUserOnline } = useSocket();

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showParticipantsInfo, setShowParticipantsInfo] = useState(false);

  const conversationId = activeConversation?.id;
  const conversationMessages = conversationId
    ? messages[conversationId] || []
    : [];
  const pagination = conversationId ? messagePagination[conversationId] : null;
  const isGroupChat = activeConversation?.isGroup;
  const uniqueMessages = [
    ...new Map(
      conversationMessages.map((message) => [message.id, message])
    ).values(),
  ];

  const observer = useRef(null);

  const lastMessageRef = useCallback(
    (node) => {
      if (loadingMessages) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && pagination?.hasNext) {
            handleLoadMore();
          }
        },
        { threshold: 0.5 }
      );

      if (node) observer.current.observe(node);
    },
    [pagination?.hasNext, loadingMessages]
  );

  const handleLoadMore = async () => {
    if (!conversationId || isLoadingMore || !pagination?.hasNext) return;

    setIsLoadingMore(true);
    await loadMoreMessages(conversationId);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    if (messagesEndRef.current && !isLoadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationMessages.length, isLoadingMore]);

  useEffect(() => {
    if (!conversationId) return;

    if (isTyping) {
      sendTypingStatus(conversationId);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, conversationId, sendTypingStatus]);

  const handleMessageChange = (e) => {
    setMessageText(e.target.value);

    // Set typing status
    if (!isTyping) {
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to clear typing status - only locally
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!messageText.trim() || !conversationId) return;

    if (editingMessageId) {
      // Update existing message
      editMessage(conversationId, editingMessageId, messageText.trim());
      setEditingMessageId(null);
    } else {
      // Send new message
      sendMessage(conversationId, messageText.trim());
    }

    setMessageText("");
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id);
    setMessageText(message.content);
    // Focus the input
    document.getElementById("message-input").focus();
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(conversationId, messageId);
    }
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setMessageText("");
  };

  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 p-6">
        <div className="text-center p-6 max-w-md">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
            <ChatBubbleLeftRightIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select a conversation to start messaging
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose from your existing conversations or start a new one
          </p>
        </div>
      </div>
    );
  }

  let headerContent;
  if (isGroupChat) {
    headerContent = (
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-10 w-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
          <UserGroupIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {activeConversation.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <UserGroupIcon className="w-3 h-3 mr-1" />
            {activeConversation.participants.length} members
          </p>
        </div>
      </div>
    );
  } else {
    const otherParticipant = activeConversation.participants.find(
      (p) => p.user?.id !== parseInt(user?.id)
    )?.user;

    const isOnline = isUserOnline?.(otherParticipant?.id);

    headerContent = (
      <div className="flex items-center space-x-3">
        <Avatar
          src={otherParticipant?.profilePicUrl}
          alt={otherParticipant?.username}
          size="md"
          isOnline={isOnline}
        />
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {otherParticipant?.username}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
    );
  }

  const currentTypingUsers = typingUsers[conversationId] || {};
  const typingUsersList = Object.values(currentTypingUsers);

  const displayMessages = [...uniqueMessages].reverse();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      {/* Conversation Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {headerContent}

        {isGroupChat && (
          <button
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setShowParticipantsInfo(!showParticipantsInfo)}
            aria-label={
              showParticipantsInfo ? "Hide participants" : "Show participants"
            }
            title={
              showParticipantsInfo ? "Hide participants" : "Show participants"
            }
          >
            <InformationCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Group participants info */}
      {showParticipantsInfo && isGroupChat && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Participants
            </h3>
            <button
              onClick={() => setShowParticipantsInfo(false)}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeConversation.participants.map((participant) => (
              <div
                key={participant.user?.id}
                className="flex items-center bg-white dark:bg-gray-700 rounded-full px-3 py-1.5 shadow-sm border border-gray-100 dark:border-gray-600"
              >
                <Avatar
                  src={participant.user?.profilePicUrl}
                  alt={participant.user?.username}
                  size="xs"
                  isOnline={isUserOnline?.(participant.user?.id)}
                />
                <span className="ml-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {participant.user?.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/30"
        ref={messagesContainerRef}
      >
        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="text-center py-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 dark:border-blue-400 border-r-transparent"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Loading more messages...
            </p>
          </div>
        )}

        {/* Show load more button if there are more messages */}
        {pagination?.hasNext && displayMessages.length > 0 && (
          <div ref={lastMessageRef} className="h-4"></div>
        )}

        {displayMessages.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
              No messages yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          displayMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === parseInt(user?.id)}
              isGroupChat={isGroupChat}
              onEdit={() => handleEditMessage(message)}
              onDelete={() => handleDeleteMessage(message.id)}
            />
          ))
        )}

        {/* Typing indicator */}
        {typingUsersList.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic flex items-center bg-white dark:bg-gray-700 py-2 px-3 rounded-lg shadow-sm">
            <div className="flex space-x-1 mr-2">
              <span
                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "200ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "400ms" }}
              ></span>
            </div>
            {typingUsersList.map((user) => user.username).join(", ")}{" "}
            {typingUsersList.length === 1 ? "is" : "are"} typing...
          </div>
        )}

        {/* Auto scroll reference */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {editingMessageId && (
            <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-md flex items-center">
              <PencilIcon className="w-3 h-3 mr-1" />
              Editing
              <button
                type="button"
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                onClick={cancelEditing}
              >
                Cancel
              </button>
            </div>
          )}

          <input
            id="message-input"
            type="text"
            value={messageText}
            onChange={handleMessageChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className={`p-2.5 rounded-full transition-colors ${
              messageText.trim()
                ? "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

const MessageBubble = ({
  message,
  isOwnMessage,
  isGroupChat,
  onEdit,
  onDelete,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const formattedTime = message.createdAt
    ? format(new Date(message.createdAt), "p")
    : "";

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className="relative max-w-xs sm:max-w-md">
        {/* Show sender avatar and name for group chats */}
        {isGroupChat && !isOwnMessage && (
          <div className="flex items-center mb-1">
            <Avatar
              src={message.sender?.profilePicUrl}
              alt={message.sender?.username}
              size="xs"
            />
            <span className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
              {message.sender?.username}
            </span>
          </div>
        )}

        <div
          className={`relative rounded-lg px-3.5 py-2.5 shadow-sm ${
            isOwnMessage
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-bl-none"
          }`}
          onMouseEnter={() => setShowOptions(true)}
          onMouseLeave={() => setShowOptions(false)}
        >
          <p className="break-words whitespace-pre-line">{message.content}</p>

          <div className="flex justify-between items-center mt-1 text-xs">
            <span
              className={
                isOwnMessage
                  ? "text-blue-100 dark:text-blue-200"
                  : "text-gray-500 dark:text-gray-400"
              }
            >
              {formattedTime}
              {message.updatedAt && message.updatedAt !== message.createdAt && (
                <span className="ml-1 italic">(edited)</span>
              )}
            </span>

            {isOwnMessage && message.isRead && (
              <div className="text-xs text-blue-100 dark:text-blue-200 flex items-center ml-2">
                <CheckCircleIcon className="h-3 w-3 mr-0.5" />
                {isGroupChat ? "Read by all" : "Read"}
              </div>
            )}
          </div>

          {isOwnMessage && showOptions && (
            <div className="absolute -right-20 top-0 flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-1">
              <button
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onEdit}
                aria-label="Edit message"
                title="Edit message"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onDelete}
                aria-label="Delete message"
                title="Delete message"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
