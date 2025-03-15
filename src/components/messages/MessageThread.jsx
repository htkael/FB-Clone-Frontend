import { useRef, useEffect, useState, useCallback } from "react";
import { useMessaging } from "../../context/MessagingContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import { Link } from "react-router-dom";
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

const MessageThread = ({ onBackClick }) => {
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
  const prevScrollHeightRef = useRef(0);
  const scrollPositionRef = useRef(0);

  const conversationId = activeConversation?.id;

  // Get conversation messages and ensure uniqueness
  const conversationMessages = conversationId
    ? messages[conversationId] || []
    : [];
  const uniqueMessages = [
    ...new Map(
      conversationMessages.map((message) => [message.id, message])
    ).values(),
  ];

  // Sort messages by date (oldest first)
  const sortedMessages = uniqueMessages.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Get pagination info with fallback if it's missing
  const pagination = conversationId ? messagePagination[conversationId] : null;

  // Create a fallback pagination object if it's missing but we know there are more messages
  const totalMessageCount = activeConversation?._count?.messages || 0;
  const effectivePagination =
    pagination ||
    (totalMessageCount > sortedMessages.length
      ? {
          page: 1,
          limit: 30,
          total: totalMessageCount,
          totalPages: Math.ceil(totalMessageCount / 30),
          hasNext: sortedMessages.length < totalMessageCount,
          hasPrevious: false,
        }
      : {
          hasNext: false,
        });

  const isGroupChat = activeConversation?.isGroup;
  const displayMessages = sortedMessages;

  const observer = useRef(null);

  // Improved intersection observer setup
  const lastMessageRef = useCallback(
    (node) => {
      // Always disconnect existing observer first
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }

      // Don't create a new observer if already loading or no more pages
      if (loadingMessages || isLoadingMore || !effectivePagination?.hasNext) {
        console.log("Observer not created: already loading or no more pages");
        return;
      }

      observer.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            effectivePagination?.hasNext &&
            !isLoadingMore &&
            !loadingMessages
          ) {
            console.log("Observer triggered: loading more messages");
            handleLoadMore();
          }
        },
        {
          threshold: 0.1,
          rootMargin: "200px 0px 0px 0px", // More margin at top to trigger earlier
          root: messagesContainerRef.current,
        }
      );

      if (node) {
        console.log("Observer attached to node");
        observer.current.observe(node);
      }
    },
    [effectivePagination?.hasNext, loadingMessages, isLoadingMore]
  );

  // Improved handleLoadMore function
  const handleLoadMore = async () => {
    console.log("handleLoadMore called, checking conditions...");

    if (!conversationId) {
      console.log("No conversation ID, aborting load");
      return;
    }

    if (isLoadingMore) {
      console.log("Already loading, aborting duplicate load");
      return;
    }

    if (loadingMessages) {
      console.log("Messages are loading, aborting load");
      return;
    }

    if (!effectivePagination?.hasNext) {
      console.log("No more pages (hasNext is false), aborting load");
      return;
    }

    // Store current scroll information before loading
    const container = messagesContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
      scrollPositionRef.current = container.scrollTop;
      console.log("Saving scroll position:", scrollPositionRef.current);
    }

    setIsLoadingMore(true);
    console.log("Setting isLoadingMore to true");

    try {
      console.log("Calling loadMoreMessages...");
      const success = await loadMoreMessages(conversationId);
      console.log("loadMoreMessages result:", success);

      // Add a small delay to prevent rapid re-triggering
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      console.log("Setting isLoadingMore to false");
      setIsLoadingMore(false);
    }
  };

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (
      !isLoadingMore &&
      prevScrollHeightRef.current > 0 &&
      messagesContainerRef.current
    ) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const newScrollHeight = container.scrollHeight;
        const heightDifference = newScrollHeight - prevScrollHeightRef.current;

        if (heightDifference > 0) {
          container.scrollTop = scrollPositionRef.current + heightDifference;
          console.log("Adjusted scroll by", heightDifference);
        }

        // Reset the saved values
        prevScrollHeightRef.current = 0;
        scrollPositionRef.current = 0;
      }, 50);
    }
  }, [isLoadingMore]);

  // Only scroll to bottom for new messages (not when loading older ones)
  useEffect(() => {
    if (
      messagesEndRef.current &&
      !isLoadingMore &&
      // Only scroll if the new message is from the current user or if already at bottom
      (displayMessages[displayMessages.length - 1]?.senderId ===
        parseInt(user?.id) ||
        messagesContainerRef.current?.scrollTop +
          messagesContainerRef.current?.clientHeight >=
          messagesContainerRef.current?.scrollHeight - 100)
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    displayMessages.length,
    isLoadingMore,
    typingUsers[conversationId]?.length,
    user?.id,
  ]);

  // Debug info for troubleshooting
  useEffect(() => {
    console.log("Messages:", displayMessages.length);
    console.log("Pagination:", effectivePagination);
    console.log("Loading states:", { isLoadingMore, loadingMessages });
  }, [
    displayMessages.length,
    effectivePagination,
    isLoadingMore,
    loadingMessages,
  ]);

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

  const currentTypingUsers = conversationId
    ? typingUsers[conversationId] || {}
    : {};
  const typingUsersList = Object.values(currentTypingUsers);

  if (!activeConversation) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden max-h-full rounded-xl">
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
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0 hidden xs:flex">
          <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          {" "}
          {/* Prevent text overflow */}
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
            {activeConversation.title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center truncate">
            <UserGroupIcon className="w-3 h-3 mr-1 inline" />
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
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Avatar
          src={otherParticipant?.profilePicUrl}
          alt={otherParticipant?.username}
          size="sm" // Smaller on mobile
          className="hidden xs:block" // Hide on very small screens
          isOnline={isOnline}
        />
        <div className="min-w-0">
          {" "}
          {/* Prevent text overflow */}
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
            {otherParticipant?.username}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden max-h-full rounded-xl">
      {/* Conversation Header with back button */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between min-h-[50px] sm:min-h-[60px] flex-shrink-0">
        {/* Back button for mobile */}
        <div className="flex items-center w-full">
          {onBackClick && (
            <button
              className="md:hidden mr-2 p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onBackClick}
              aria-label="Back to conversations"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* On small screens, make the header content take less space */}
          <div className="flex items-center max-w-[80%] sm:max-w-full">
            {headerContent}
          </div>
        </div>

        {isGroupChat && (
          <button
            className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setShowParticipantsInfo(!showParticipantsInfo)}
            aria-label={
              showParticipantsInfo ? "Hide participants" : "Show participants"
            }
            title={
              showParticipantsInfo ? "Hide participants" : "Show participants"
            }
          >
            <InformationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>

      {/* Group participants info */}
      {showParticipantsInfo && isGroupChat && (
        <div className="p-2 sm:p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Participants
            </h3>
            <button
              onClick={() => setShowParticipantsInfo(false)}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {activeConversation.participants.map((participant) => (
              <div
                key={participant.user?.id}
                className="flex items-center bg-white dark:bg-gray-700 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm border border-gray-100 dark:border-gray-600"
              >
                <Link
                  to={`/profile/${participant.user?.id}`}
                  className="flex-shrink-0"
                >
                  <Avatar
                    src={participant.user?.profilePicUrl}
                    alt={participant.user?.username}
                    size="xs"
                    isOnline={isUserOnline?.(participant.user?.id)}
                  />
                </Link>
                <span className="ml-1 sm:ml-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px] sm:max-w-full">
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
      <div className="p-2 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80">
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-1.5 xs:space-x-2"
        >
          {editingMessageId && (
            <div className="hidden xs:flex px-2 xs:px-3 py-1 text-xs rounded-md items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
              <PencilIcon className="w-3 h-3 mr-1" />
              Editing
              <button
                type="button"
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-xs"
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
            className="flex-1 w-full min-w-0 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className={`p-1.5 xs:p-2 rounded-full transition-colors ${
              messageText.trim()
                ? "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="h-4 w-4 xs:h-5 xs:w-5" />
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
  const timeoutRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (isOwnMessage) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a slight delay to ensure hover is intentional
      timeoutRef.current = setTimeout(() => {
        setShowOptions(true);
      }, 50);
    }
  }, [isOwnMessage]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Add a slight delay before hiding to prevent accidental mouse-out
    timeoutRef.current = setTimeout(() => {
      setShowOptions(false);
    }, 200);
  }, []);

  const formattedTime = message.createdAt
    ? format(new Date(message.createdAt), "p")
    : "";

  return (
    <div
      className={`flex relative ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Edit/delete options in top right corner */}
          {isOwnMessage && showOptions && (
            <div
              className="absolute top-2 right-2 flex items-center space-x-1 z-10"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="p-1 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 rounded-full transition-colors"
                onClick={onEdit}
                aria-label="Edit message"
                title="Edit message"
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
              <button
                className="p-1 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors"
                onClick={onDelete}
                aria-label="Delete message"
                title="Delete message"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <p className="break-words whitespace-pre-line pr-14">
            {message.content}
          </p>

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
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
