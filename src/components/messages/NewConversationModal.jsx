import React, { useState, useEffect, useRef } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import { useMessaging } from "../../context/MessagingContext";
import { userAPI } from "../../services/api";
import Avatar from "../common/Avatar";
import { useSocket } from "../../context/SocketContext";

// Import icons
import {
  XMarkIcon,
  UserPlusIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const NewConversationModal = ({ isOpen, onClose, isGroupChat = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupTitle, setGroupTitle] = useState("");
  const { startConversation } = useMessaging();
  const { isUserOnline } = useSocket();
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await userAPI.searchUser({ searchTerm });
        setSearchResults(response.data.data || []);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleUserSelect = (user) => {
    if (isGroupChat) {
      // For group chats, add to selected users array
      if (!selectedUsers.some((u) => u.id === user.id)) {
        setSelectedUsers([...selectedUsers, user]);

        // Auto-generate group name from first 2-3 users if not set
        if (!groupTitle.trim() && selectedUsers.length <= 2) {
          const usernames = [...selectedUsers, user].map((u) => u.username);
          if (usernames.length > 2) {
            setGroupTitle(
              `${usernames.slice(0, 2).join(", ")} & ${
                usernames.length - 1
              } others`
            );
          } else {
            setGroupTitle(usernames.join(", "));
          }
        }
      }
    } else {
      // For direct messages, start conversation immediately
      handleStartConversation([user.id]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleStartConversation = async (userIds = null) => {
    try {
      const participantIds = userIds || selectedUsers.map((u) => u.id);

      if (participantIds.length === 0) {
        return;
      }

      if (isGroupChat) {
        if (!groupTitle.trim()) {
          // Show error for missing group title
          return;
        }

        await startConversation({
          participantIds,
          title: groupTitle.trim(),
          isGroup: true,
        });
      } else {
        await startConversation({
          participantIds: [participantIds[0]],
          isGroup: false,
        });
      }

      onClose();
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          {isGroupChat ? (
            <>
              <UserGroupIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              Create Group Chat
            </>
          ) : (
            <>
              <UserPlusIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              New Message
            </>
          )}
        </div>
      }
      size="md"
    >
      {isGroupChat && (
        <div className="mb-5">
          <Input
            label="Group Name"
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            placeholder="Enter a name for your group"
            required
            leftIcon={<UserGroupIcon className="h-5 w-5 text-gray-400" />}
          />
        </div>
      )}

      <div className="mb-5 relative">
        <Input
          label="Search Users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username or name"
          ref={searchInputRef}
          leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
        />
        {searchTerm && searchTerm.length < 2 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
            <span className="text-amber-500 dark:text-amber-400 mr-1">•</span>
            Please enter at least 2 characters to search
          </p>
        )}
      </div>

      {/* Selected users for group chat */}
      {isGroupChat && selectedUsers.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <UsersIcon className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" />
            Selected Users ({selectedUsers.length})
          </div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center bg-white dark:bg-gray-700 rounded-full pl-1 pr-2 py-1 shadow-sm border border-gray-100 dark:border-gray-600"
              >
                <Avatar
                  src={user.profilePicUrl}
                  alt={user.username}
                  size="xs"
                />
                <span className="ml-1.5 text-sm text-gray-800 dark:text-gray-200">
                  {user.username}
                </span>
                <button
                  className="ml-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  onClick={() => handleRemoveUser(user.id)}
                  aria-label={`Remove ${user.username}`}
                  title={`Remove ${user.username}`}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto shadow-sm">
        {isSearching ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 dark:border-blue-400 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Searching users...
            </p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {searchResults.map((user) => {
              const isSelected = selectedUsers.some((u) => u.id === user.id);
              const isOnline = isUserOnline?.(user.id);

              return (
                <div
                  key={user.id}
                  className={`py-3 px-4 cursor-pointer flex items-center transition-colors ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                  onClick={() => handleUserSelect(user)}
                >
                  <Avatar
                    src={user.profilePicUrl}
                    alt={user.username}
                    size="sm"
                    isOnline={isOnline}
                  />
                  <div className="ml-3 flex-1">
                    <p
                      className={`font-medium ${
                        isSelected
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {user.username}
                    </p>
                    {user.firstName && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.firstName} {user.lastName || ""}
                      </p>
                    )}
                  </div>
                  {isSelected && isGroupChat && (
                    <div className="flex-shrink-0 text-blue-500 dark:text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : searchTerm.length >= 2 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
              No users found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try searching with a different keyword
            </p>
          </div>
        ) : searchTerm.length > 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MagnifyingGlassIcon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            Continue typing to search users
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MagnifyingGlassIcon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            Search for users to {isGroupChat ? "add to your group" : "message"}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose} size="md">
          Cancel
        </Button>

        {isGroupChat && (
          <Button
            variant="primary"
            onClick={() => handleStartConversation()}
            disabled={selectedUsers.length < 2 || !groupTitle.trim()}
            size="md"
            icon={<UserGroupIcon className="w-5 h-5" />}
          >
            Create Group
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default NewConversationModal;
