import { useEffect } from "react";
import { useMessaging } from "../../context/MessagingContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import { format } from "date-fns";
import { truncateText } from "../../utils/stringUtils";

// Import icons
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const ConversationList = () => {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    unreadCounts,
    fetchConversations,
  } = useMessaging();

  const { isUserOnline } = useSocket();
  const { user } = useAuth();

  // Refresh conversations periodically
  useEffect(() => {
    fetchConversations();

    const interval = setInterval(() => {
      fetchConversations();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [fetchConversations]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
          Conversations
        </h2>
      </div>

      <div className="overflow-y-auto flex-grow">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
              No conversations yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start a new message or group chat to begin messaging
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {conversations.map((conversation) => {
              const isActive = activeConversation?.id === conversation.id;
              const unreadCount = unreadCounts[conversation.id] || 0;

              // For group chats
              if (conversation.isGroup) {
                return (
                  <GroupConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={isActive}
                    unreadCount={unreadCount}
                    onClick={() => setActiveConversation(conversation)}
                  />
                );
              }

              // For direct messages - find the other participant
              const otherParticipant = conversation.participants.find(
                (p) => p.user?.id !== parseInt(user?.id)
              )?.user;

              if (!otherParticipant) return null;

              return (
                <div
                  key={conversation.id}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={otherParticipant.profilePicUrl}
                        alt={otherParticipant.username}
                        size="md"
                        isOnline={isUserOnline(otherParticipant.id)}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3
                          className={`font-medium truncate ${
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {otherParticipant.username}
                        </h3>
                        {conversation.messages[0] && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center ml-1">
                            <ClockIcon className="w-3 h-3 mr-1 inline" />
                            {format(
                              new Date(conversation.messages[0].createdAt),
                              "p"
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <p
                          className={`text-sm truncate ${
                            unreadCount > 0
                              ? "font-medium text-gray-800 dark:text-gray-200"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {conversation.messages[0]
                            ? truncateText(conversation.messages[0].content, 30)
                            : "No messages yet"}
                        </p>

                        {unreadCount > 0 && (
                          <Badge
                            count={unreadCount}
                            variant="primary"
                            size="sm"
                            className="ml-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Group conversation item component
const GroupConversationItem = ({
  conversation,
  isActive,
  unreadCount,
  onClick,
}) => {
  return (
    <div
      className={`px-4 py-3 cursor-pointer transition-colors ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="relative flex-shrink-0">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-10 w-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
            <UserGroupIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3
              className={`font-medium truncate ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {conversation.title}
            </h3>
            {conversation.messages[0] && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center ml-1">
                <ClockIcon className="w-3 h-3 mr-1 inline" />
                {format(new Date(conversation.messages[0].createdAt), "p")}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center mt-1">
            <p
              className={`text-sm truncate ${
                unreadCount > 0
                  ? "font-medium text-gray-800 dark:text-gray-200"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {conversation.messages[0] ? (
                <>
                  <span className="font-medium">
                    {conversation.messages[0].sender?.username}:
                  </span>{" "}
                  {truncateText(conversation.messages[0].content, 25)}
                </>
              ) : (
                "No messages yet"
              )}
            </p>

            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                variant="primary"
                size="sm"
                className="ml-2"
              />
            )}
          </div>

          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <UsersIcon className="w-3 h-3 mr-1" />
            {conversation.participants.length} members
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
