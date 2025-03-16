import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  signup: (userData) => api.post("/auth/signup", userData),
  logout: () => api.post("/auth/logout"),
  guest_login: () => api.post("/auth/guest-login"),
};

export const postAPI = {
  getPosts: () => api.get("/posts"),
  createPost: async (formData) => {
    const response = await api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);
  },
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  postComment: (postId, content) =>
    api.post(`/posts/${postId}/comments`, content),
  likePost: (postId) => api.post(`/posts/${postId}/likes`),
  getLikes: (postId) => api.get(`/posts/${postId}/likes`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  editPost: (postId, formData) =>
    api.put(`/posts/${postId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  getUserFeed: (params = {}) => api.get("/feed", { params }),
};

export const userAPI = {
  getUsers: () => api.get("/users"),
  searchUser: (params) => api.get("/users/search", { params }),
  getPostsFromUser: (userId, params = {}) =>
    api.get(`/users/${userId}/posts`, { params }),
  getCommentsFromUser: (userId) => api.get(`/users/${userId}/comments`),
  getLikesFromUser: (userId) => api.get(`/users/${userId}/likes`),
  getFriendsFromUser: (userId) => api.get(`/users/${userId}/friends`),
  getUser: (userId) => api.get(`users/${userId}`),
  editUser: (userId, content) => api.put(`users/${userId}`, content),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

export const commentAPI = {
  editComment: (commentId, content) =>
    api.put(`/comments/${commentId}`, content),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export const friendAPI = {
  sendRequest: (userId) => api.post(`/friends/request/${userId}`),
  deleteRequest: (userId) => api.delete(`/friends/request/${userId}`),
  getRequests: () => api.get("/friends/requests/pending"),
  acceptRequest: (requestId) => api.put(`/friends/request/${requestId}/accept`),
  rejectRequest: (requestId) => api.put(`/friends/request/${requestId}/reject`),
  removeFriend: (friendId) => api.delete(`/friends/${friendId}`),
};

export const conversationAPI = {
  getConversations: () => api.get("/conversations"),
  createConversation: (data) => api.post("/conversations", data),
  getUnread: () => api.get("/conversations/unread"),
  markConversationAsRead: (conversationId) =>
    api.put(`/conversations/${conversationId}/read`),
  getConversation: (conversationId, params = {}) =>
    api.get(`/conversations/${conversationId}`, { params }),
  editTitle: (conversationId, content) =>
    api.put(`/conversations/${conversationId}`, content),
  addParticipant: (conversationId, userId) =>
    api.post(`/conversations/${conversationId}/participants`, userId),
  removeSelf: (conversationId) =>
    api.delete(`/conversations/${conversationId}/participants`),
  getParticipants: (conversationId) =>
    api.post(`/conversations/${conversationId}/participants`),
  getConversationUnread: (conversationId) =>
    api.get(`/conversations/${conversationId}/messages/unread`),
};

export const messageAPI = {
  sendMessage: async (conversationId, content) => {
    try {
      console.log(
        `Sending message to conversation ${conversationId}:`,
        content
      );
      const response = await api.post(
        `/conversations/${conversationId}/messages`,
        { content }
      );
      return response.data;
    } catch (error) {
      console.error("Complete error details:", error);
      throw error;
    }
  },
  editMessage: (conversationId, messageId, content) =>
    api.put(`/conversations/${conversationId}/messages/${messageId}`, content),
  deleteMessage: (conversationId, messageId) =>
    api.delete(`/conversations/${conversationId}/messages/${messageId}`),
};

export const notificationAPI = {
  getNotifications: () => api.get("/notifications"),
  getUnreadNotifications: () => api.get("/notifications/unread"),
  markNotificationsAsRead: () => api.put("/notifications/mark-all-read"),
  markNotificationAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
};
