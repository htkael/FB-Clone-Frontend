import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { friendAPI } from "../../services/api";
import Button from "../common/Button";

const FriendButton = ({ userId, isFriend, friendshipStatus }) => {
  const queryClient = useQueryClient();
  const [requestId, setRequestId] = useState(null);

  // Fetch pending friend requests to get requestId if needed
  const { data: pendingRequests } = useQuery({
    queryKey: ["friend-requests", "pending"],
    queryFn: friendAPI.getRequests,
    select: (response) => response.data,
    enabled: friendshipStatus === "PENDING", // Only fetch when we have a pending request
    staleTime: 60000, // 1 minute
  });

  // Find the relevant request ID from pending requests
  useEffect(() => {
    if (pendingRequests && friendshipStatus === "PENDING") {
      // Look for requests where this user is either the sender or receiver
      const relevantRequest = pendingRequests.find(
        (req) =>
          req.senderId === parseInt(userId) ||
          req.receiverId === parseInt(userId)
      );

      if (relevantRequest) {
        setRequestId(relevantRequest.id);
      }
    }
  }, [pendingRequests, userId, friendshipStatus]);

  // Mutations for friend actions
  const sendRequestMutation = useMutation({
    mutationFn: () => friendAPI.sendRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: () => friendAPI.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: () => friendAPI.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: () => friendAPI.deleteRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: () => friendAPI.removeFriend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  // If already friends, show remove friend button
  if (isFriend) {
    return (
      <div className="flex">
        <Button
          onClick={() => removeFriendMutation.mutate()}
          isLoading={removeFriendMutation.isPending}
          variant="outline"
        >
          Friends
        </Button>
      </div>
    );
  }

  // If received a friend request
  if (
    friendshipStatus === "PENDING" &&
    pendingRequests?.some((req) => req.senderId === parseInt(userId))
  ) {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={() => acceptRequestMutation.mutate()}
          isLoading={acceptRequestMutation.isPending}
          variant="primary"
          disabled={!requestId}
        >
          Accept
        </Button>
        <Button
          onClick={() => rejectRequestMutation.mutate()}
          isLoading={rejectRequestMutation.isPending}
          variant="outline"
          disabled={!requestId}
        >
          Decline
        </Button>
      </div>
    );
  }

  // If sent a friend request
  if (friendshipStatus === "PENDING") {
    return (
      <Button
        onClick={() => deleteRequestMutation.mutate()}
        isLoading={deleteRequestMutation.isPending}
        variant="outline"
      >
        Cancel Request
      </Button>
    );
  }

  // Default: No friendship yet
  return (
    <Button
      onClick={() => sendRequestMutation.mutate()}
      isLoading={sendRequestMutation.isPending}
      variant="primary"
    >
      Add Friend
    </Button>
  );
};

export default FriendButton;
