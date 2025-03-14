import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import ConversationList from "../components/messages/ConversationList";
import MessageThread from "../components/messages/MessageThread";
import NewConversationModal from "../components/messages/NewConversationModal";
import { useMessaging } from "../context/MessagingContext";
import EmptyState from "../components/common/EmptyState";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import SettingsModal from "../components/settings/SettingsModal";

// Import icons (assuming you're using heroicons)
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  UserGroupIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const MessagingPage = () => {
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
    useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const { getTotalUnreadCount } = useMessaging();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openNewConversationModal = (isGroup = false) => {
    setIsGroupChat(isGroup);
    setIsNewConversationModalOpen(true);
  };

  const totalUnread = getTotalUnreadCount();

  const openSettingsModal = () => {
    setIsSettingsOpen(true);
  };

  return (
    <MainLayout openModal={openSettingsModal}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
            <ChatBubbleLeftRightIcon className="w-7 h-7 mr-2 text-blue-500 dark:text-blue-400" />
            Messages
            {totalUnread > 0 && (
              <Badge
                className="ml-2"
                count={totalUnread}
                variant="danger"
                size="md"
              />
            )}
          </h1>
          <div className="flex space-x-3">
            <Button
              onClick={() => openNewConversationModal(false)}
              variant="primary"
              size="md"
              className="shadow-sm"
              icon={<PencilSquareIcon className="w-5 h-5" />}
            >
              New Message
            </Button>
            <Button
              onClick={() => openNewConversationModal(true)}
              variant="success"
              size="md"
              className="shadow-sm"
              icon={<UserGroupIcon className="w-5 h-5" />}
            >
              New Group
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-14rem)] bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Conversations List */}
          <div className="md:col-span-1 h-full overflow-hidden border-r border-gray-200 dark:border-gray-700">
            <ConversationList />
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2 h-full overflow-hidden bg-gray-50 dark:bg-gray-800/50">
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

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </MainLayout>
  );
};

export default MessagingPage;
