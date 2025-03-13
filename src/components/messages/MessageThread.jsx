import { useRef, useEffect, useState, useCallback } from "react";
import { useMessaging } from "../../context/MessagingContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import { format } from "date-fns";
import { FiSend, FiEdit2, FiTrash2, FiInfo } from "react-icons/fi";

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
  const { sendTypingStatus } = useSocket();

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
      <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-md">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a conversation to start messaging
          </h3>
          <p className="text-gray-500">
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
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-10 w-10 rounded-full flex items-center justify-center text-white font-medium">
          {activeConversation.title.charAt(0)}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">
            {activeConversation.title}
          </h2>
          <p className="text-sm text-gray-500">
            {activeConversation.participants.length} members
          </p>
        </div>
      </div>
    );
  } else {
    const otherParticipant = activeConversation.participants.find(
      (p) => p.user?.id !== parseInt(user?.id)
    )?.user;

    headerContent = (
      <div className="flex items-center space-x-3">
        <Avatar
          src={otherParticipant?.profilePicUrl}
          alt={otherParticipant?.username}
          size="md"
        />
        <div>
          <h2 className="font-semibold text-gray-900">
            {otherParticipant?.username}
          </h2>
        </div>
      </div>
    );
  }

  const currentTypingUsers = typingUsers[conversationId] || {};
  const typingUsersList = Object.values(currentTypingUsers);

  const displayMessages = [...conversationMessages].reverse();

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      {/* Conversation Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {headerContent}

        {isGroupChat && (
          <button
            className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
            onClick={() => setShowParticipantsInfo(!showParticipantsInfo)}
          >
            <FiInfo className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Group participants info */}
      {showParticipantsInfo && isGroupChat && (
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Participants</h3>
          <div className="flex flex-wrap gap-2">
            {activeConversation.participants.map((participant) => (
              <div
                key={participant.user?.id}
                className="flex items-center bg-white rounded-full px-2 py-1 shadow-sm"
              >
                <Avatar
                  src={participant.user?.profilePicUrl}
                  alt={participant.user?.username}
                  size="xs"
                />
                <span className="ml-1 text-sm">
                  {participant.user?.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        ref={messagesContainerRef}
      >
        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="text-center py-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
            <p className="text-sm text-gray-500 mt-1">
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
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">
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
          <div className="text-sm text-gray-500 italic">
            {typingUsersList.map((user) => user.username).join(", ")}{" "}
            {typingUsersList.length === 1 ? "is" : "are"} typing...
          </div>
        )}

        {/* Auto scroll reference */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {editingMessageId && (
            <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
              Editing
              <button
                type="button"
                className="ml-2 text-blue-700"
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className={`p-2 rounded-full ${
              messageText.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiSend className="h-5 w-5" />
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
      <div className="relative max-w-3/4">
        {/* Show sender avatar and name for group chats */}
        {isGroupChat && !isOwnMessage && (
          <div className="flex items-center mb-1">
            <Avatar
              src={message.sender?.profilePicUrl}
              alt={message.sender?.username}
              size="xs"
            />
            <span className="ml-1 text-xs font-medium text-gray-700">
              {message.sender?.username}
            </span>
          </div>
        )}

        <div
          className={`relative rounded-lg p-3 ${
            isOwnMessage
              ? "bg-blue-500 text-white rounded-tr-none"
              : "bg-white border border-gray-200 rounded-tl-none"
          }`}
          onMouseEnter={() => setShowOptions(true)}
          onMouseLeave={() => setShowOptions(false)}
        >
          <p className="break-words">{message.content}</p>
          <span
            className={`text-xs mt-1 block ${
              isOwnMessage ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {formattedTime}
          </span>

          {isOwnMessage && showOptions && (
            <div className="absolute -right-10 top-0 bg-white rounded-full shadow-md">
              <button
                className="p-2 text-gray-600 hover:text-blue-500"
                onClick={onEdit}
              >
                <FiEdit2 className="h-4 w-4" />
              </button>
              <button
                className="p-2 text-gray-600 hover:text-red-500"
                onClick={onDelete}
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Edit/Delete timestamp indicator */}
          {message.updatedAt && message.updatedAt !== message.createdAt && (
            <span
              className={`text-xs italic ${
                isOwnMessage ? "text-blue-100" : "text-gray-400"
              }`}
            >
              (edited)
            </span>
          )}

          {isOwnMessage && message.isRead && (
            <div className="text-xs text-gray-400 mt-1 text-right">
              {isGroupChat ? "Read by all" : "Read"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
