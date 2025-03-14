import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "../../services/api";
import Button from "../common/Button";
import TextArea from "../common/TextArea";

// Import icons (assuming you're using heroicons)
import { PencilIcon, UserIcon } from "@heroicons/react/24/outline";

const ProfileBio = ({ bio, userId, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(bio || "");
  const queryClient = useQueryClient();

  const updateBioMutation = useMutation({
    mutationFn: (newBio) => userAPI.editUser(userId, { bio: newBio }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error(`Failed to update bio: ${error}`);
    },
  });

  const handleSave = () => {
    updateBioMutation.mutate(bioText);
  };

  if (isEditing) {
    return (
      <div className="mt-5 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <UserIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              About Me
            </h3>
          </div>

          {/* Note: TextArea has its own styling with proper dark mode support */}
          <TextArea
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            placeholder="Write something about yourself..."
            rows={4}
            maxLength={500}
            showCount
            className="text-gray-800 dark:text-gray-200"
          />

          <div className="flex gap-2 mt-3 justify-end">
            <Button
              onClick={() => {
                setIsEditing(false);
                setBioText(bio || "");
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              isLoading={updateBioMutation.isPending}
              disabled={updateBioMutation.isPending || bioText.trim() === bio}
              variant="primary"
              size="sm"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 mb-6">
      {bio ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                About Me
              </h3>
            </div>

            {isOwnProfile && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="text"
                size="xs"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                <span>Edit</span>
              </Button>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {bio}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-dashed border-gray-200 dark:border-gray-700 text-center">
          {isOwnProfile ? (
            <>
              <p className="text-gray-500 dark:text-gray-400 mb-3">
                Add a bio to tell people more about yourself
              </p>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="mx-auto"
              >
                <PencilIcon className="w-4 h-4 mr-1.5" />
                Add Bio
              </Button>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              This user hasn't added a bio yet
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileBio;
