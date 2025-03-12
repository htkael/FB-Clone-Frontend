import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import ConversationList from "../components/messages/ConversationList";
import MessageThread from "../components/messages/MessageThread";
import NewConversationModal from "../components/messages/NewConversationModal";
import { useMessaging } from "../context/MessagingContext";
import { FiEdit, FiPlus } from "react-icons/fi";
import EmptyState from "../components/common/EmptyState";
import Badge from "../components/common/Badge";

const MessagingPage = () => {
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
    useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const { getTotalUnreadCount } = useMessaging();

  const openNewConversationModal = (isGroup = false) => {
    setIsGroupChat(isGroup);
    setIsNewConversationModalOpen(true);
  };

  const totalUnread = getTotalUnreadCount();

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between  items-center mb-6">
          <h1 className="flex items-center text-2xl font-bold text-white">
            Messages
            {totalUnread > 0 && <Badge className="ml-2" count={totalUnread} />}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => openNewConversationModal(false)}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <FiEdit className="mr-2" />
              New Message
            </button>
            <button
              onClick={() => openNewConversationModal(true)}
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <FiPlus className="mr-2" />
              New Group
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <div className="md:col-span-1 h-full overflow-hidden">
            <ConversationList />
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2 h-full overflow-hidden">
            <MessageThread />
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      {isNewConversationModalOpen && (
        <NewConversationModal
          isOpen={isNewConversationModalOpen}
          onClose={() => setIsNewConversationModalOpen(false)}
          isGroupChat={isGroupChat}
        />
      )}
    </MainLayout>
  );
};

export default MessagingPage;
