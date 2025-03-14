import { useState } from "react";
import Modal from "../common/Modal";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await userAPI.deleteUser(user.id);
      logout();
      onClose();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="sm">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Dark Mode
          </span>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              theme === "dark" ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          {!showDeleteConfirm ? (
            <button
              className="text-red-600 hover:text-red-800 font-medium"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleDeleteAccount()}
                >
                  Yes, Delete
                </button>
                <button
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
