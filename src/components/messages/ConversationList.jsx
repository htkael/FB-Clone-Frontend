import { useEffect } from "react";
import { useMessaging } from "../../context/MessagingContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import { format } from "date-fns";
import { truncateText } from "../../utils/stringUtils";

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

  console.log("Conversations", conversations);

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Conversations</h2>
      </div>

      <div className="overflow-y-auto flex-grow">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => {
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
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isActive ? "bg-blue-50" : ""
                }`}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar
                      src={otherParticipant.profilePicUrl}
                      alt={otherParticipant.username}
                      size="md"
                    />
                    {isUserOnline(otherParticipant.id) && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium text-gray-900 truncate">
                        {otherParticipant.username}
                      </h3>
                      {conversation.messages[0] && (
                        <span className="text-xs text-gray-500">
                          {format(
                            new Date(conversation.messages[0].createdAt),
                            "p"
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.messages[0]
                          ? truncateText(conversation.messages[0].content, 30)
                          : "No messages yet"}
                      </p>

                      {unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
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
      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isActive ? "bg-blue-50" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-10 w-10 rounded-full flex items-center justify-center text-white font-medium">
            {conversation.title.charAt(0)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-medium text-gray-900 truncate">
              {conversation.title}
            </h3>
            {conversation.messages[0] && (
              <span className="text-xs text-gray-500">
                {format(new Date(conversation.messages[0].createdAt), "p")}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600 truncate">
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
              <span className="ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="mt-1 text-xs text-gray-500">
            {conversation.participants.length} members
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
