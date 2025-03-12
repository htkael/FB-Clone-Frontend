import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "../../services/api";
import Button from "../common/Button";
import TextArea from "../common/TextArea";

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
      <div className="mt-4 mb-6">
        <TextArea
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          placeholder="Write something about yourself..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleSave}
            isLoading={updateBioMutation.isPending}
            disabled={updateBioMutation.isPending}
            variant="primary"
            size="sm"
          >
            Save
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setBioText(bio || "");
            }}
            variant="secondary"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 mb-6">
      <div className="flex justify-between items-start">
        <p className="text-gray-700">{bio || "No bio yet"}</p>
        {isOwnProfile && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="text"
            size="sm"
            className="text-blue-500 hover:text-blue-700"
          >
            {bio ? "Edit" : "Add Bio"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileBio;
