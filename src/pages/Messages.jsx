import { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import ConversationList from "../components/messages/ConversationList";
import MessageThread from "../components/messages/MessageThread";
import NewConversationModal from "../components/messages/NewConversationModal";
import { useMessaging } from "../context/MessagingContext";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import SettingsModal from "../components/settings/SettingsModal";

// Import icons
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  UserGroupIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const MessagingPage = () => {
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
    useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const { getTotalUnreadCount, activeConversation, setActiveConversation } =
    useMessaging();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view on mount and window resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkMobileView();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobileView);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // When a conversation is selected on mobile, hide the conversation list
  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

  // Go back to conversation list on mobile
  const handleBackToList = () => {
    setShowConversationList(true);
  };

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
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h1 className="flex items-center text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            <ChatBubbleLeftRightIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-1.5 sm:mr-2 text-blue-500 dark:text-blue-400" />
            <span className="hidden sm:inline">Messages</span>
            {totalUnread > 0 && (
              <Badge
                className="ml-2"
                count={totalUnread}
                variant="danger"
                size="sm"
              />
            )}
          </h1>
          <div className="flex gap-2 sm:gap-3">
            <Button
              onClick={() => openNewConversationModal(false)}
              variant="primary"
              size="xxs"
              className="shadow-sm min-w-0 sm:min-w-[110px] whitespace-nowrap text-xs sm:text-sm transition-all duration-200"
              icon={
                <PencilSquareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              }
            >
              <span className="hidden xxs:inline xs:inline">New Message</span>
              <span className="xxs:hidden xs:hidden">New</span>
            </Button>
            <Button
              onClick={() => openNewConversationModal(true)}
              variant="success"
              size="xxs"
              className="shadow-sm min-w-0 sm:min-w-[110px] whitespace-nowrap text-xs sm:text-sm transition-all duration-200"
              icon={
                <UserGroupIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              }
            >
              <span className="hidden xxs:inline xs:inline">New Group</span>
              <span className="xxs:hidden xs:hidden">Group</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)] md:h-[calc(100vh-200px)] mb-16 md:mb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Mobile Back Button */}

          {/* Conversation List */}
          <div
            className={`border-r border-gray-200 dark:border-gray-700 h-full overflow-hidden ${
              isMobileView && activeConversation && !showConversationList
                ? "hidden md:block xs:h-[80%]"
                : "block"
            }`}
          >
            <div className="h-full overflow-y-auto">
              <ConversationList
                onSelectConversation={handleConversationSelect}
              />
            </div>
          </div>

          {/* Message Thread */}
          <div
            className={`bg-gray-50 dark:bg-gray-800/50 h-full overflow-hidden md:col-span-2 ${
              isMobileView && (!activeConversation || showConversationList)
                ? "hidden md:block"
                : "block"
            }`}
          >
            <div className="h-full overflow-y-auto">
              <MessageThread onBackClick={handleBackToList} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
