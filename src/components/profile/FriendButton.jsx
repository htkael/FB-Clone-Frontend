import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { friendAPI } from "../../services/api";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

const FriendButton = ({
  userId,
  isFriend,
  friendshipStatus,
  size = "md",
  page,
}) => {
  const queryClient = useQueryClient();
  const [requestId, setRequestId] = useState(null);
  const { user } = useAuth();

  console.log(
    "Friend button stats",
    userId,
    isFriend,
    friendshipStatus,
    (size = "md"),
    page
  );

  const { data: pendingRequests } = useQuery({
    queryKey: ["friend-requests", "pending"],
    queryFn: friendAPI.getRequests,
    select: (response) => response.data.data,
    enabled: friendshipStatus === "PENDING",
    staleTime: 60000,
  });

  useEffect(() => {
    if (pendingRequests && friendshipStatus === "PENDING") {
      const relevantRequest = pendingRequests.find(
        (req) =>
          req.userId === parseInt(userId) || req.friendId === parseInt(userId)
      );

      if (relevantRequest) {
        setRequestId(relevantRequest.id);
      }
    }
  }, [pendingRequests, userId, friendshipStatus]);

  const sendRequestMutation = useMutation({
    mutationFn: () => friendAPI.sendRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["users", page] });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: () => friendAPI.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["users", page] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: () => friendAPI.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["users", page] });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: () => friendAPI.deleteRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["users", page] });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: () => friendAPI.removeFriend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["users", page] });
    },
  });

  if (userId === user.id) return;

  if (isFriend) {
    return (
      <div className="flex">
        <Button
          onClick={() => removeFriendMutation.mutate()}
          isLoading={removeFriendMutation.isPending}
          variant="outline"
          size={size}
        >
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center">
            <CheckBadgeIcon className="w-4 h-4 mr-1" />
            Friends
          </span>
        </Button>
      </div>
    );
  }

  if (
    friendshipStatus === "PENDING" &&
    pendingRequests?.some((req) => req.userId === parseInt(userId))
  ) {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={() => acceptRequestMutation.mutate()}
          isLoading={acceptRequestMutation.isPending}
          variant="primary"
          disabled={!requestId}
          size={size}
        >
          Accept
        </Button>
        <Button
          onClick={() => rejectRequestMutation.mutate()}
          isLoading={rejectRequestMutation.isPending}
          variant="outline"
          disabled={!requestId}
          size={size}
        >
          Decline
        </Button>
      </div>
    );
  }

  if (friendshipStatus === "PENDING") {
    return (
      <Button
        onClick={() => deleteRequestMutation.mutate()}
        isLoading={deleteRequestMutation.isPending}
        variant="outline"
        size={size}
      >
        Cancel Request
      </Button>
    );
  }

  return (
    <Button
      onClick={() => sendRequestMutation.mutate()}
      isLoading={sendRequestMutation.isPending}
      variant="primary"
      size={size}
    >
      Add Friend
    </Button>
  );
};

export default FriendButton;
