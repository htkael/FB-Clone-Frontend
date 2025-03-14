import React, { useState, useEffect, useRef } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import { useMessaging } from "../../context/MessagingContext";
import { userAPI } from "../../services/api";
import Avatar from "../common/Avatar";

const NewConversationModal = ({ isOpen, onClose, isGroupChat = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupTitle, setGroupTitle] = useState("");
  const { startConversation } = useMessaging();
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
        console.log(response);

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
      title={isGroupChat ? "Create Group Chat" : "New Message"}
    >
      {isGroupChat && (
        <div className="mb-4">
          <Input
            label="Group Name"
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            placeholder="Enter a name for your group"
            required
          />
        </div>
      )}

      <div className="mb-4">
        <Input
          label="Search Users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username or name"
          ref={searchInputRef}
        />
        {searchTerm && searchTerm.length < 2 && (
          <p className="text-sm text-gray-500 mt-1">
            Please enter at least 2 characters to search
          </p>
        )}
      </div>

      {/* Selected users for group chat */}
      {isGroupChat && selectedUsers.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selected Users
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center bg-gray-100 rounded-full pl-1 pr-2 py-1"
              >
                <Avatar
                  src={user.profilePicUrl}
                  alt={user.username}
                  size="xs"
                />
                <span className="ml-1 text-sm">{user.username}</span>
                <button
                  className="ml-1 text-gray-500 hover:text-red-500"
                  onClick={() => handleRemoveUser(user.id)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      <div className="max-h-60 overflow-y-auto">
        {isSearching ? (
          <div className="text-center py-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="divide-y">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="py-2 px-2 hover:bg-gray-50 cursor-pointer flex items-center"
                onClick={() => handleUserSelect(user)}
              >
                <Avatar
                  src={user.profilePicUrl}
                  alt={user.username}
                  size="sm"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{user.username}</p>
                  {user.firstName && (
                    <p className="text-sm text-gray-500">
                      {user.firstName} {user.lastName || ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm.length >= 2 ? (
          <div className="text-center py-4 text-gray-500">No users found</div>
        ) : null}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>

        {isGroupChat && (
          <Button
            variant="primary"
            onClick={() => handleStartConversation()}
            disabled={selectedUsers.length < 2 || !groupTitle.trim()}
          >
            Create Group
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default NewConversationModal;
