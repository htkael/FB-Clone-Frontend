export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with a status code outside of 2xx range
    const { data, status } = error.response;
    const message = data.message || "Something went wrong with the request";

    // Handle token expiration
    if (status === 401) {
      // Clear local storage and redirect to login if token is invalid
      if (
        data.message === "Invalid token" ||
        data.message === "Token expired"
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
    }

    throw new ApiError(message, status, data);
  } else if (error.request) {
    // Request was made but no response received
    throw new ApiError(
      "No response from server. Please check your internet connection.",
      0,
      null
    );
  } else {
    // Error in setting up the request
    throw new ApiError(error.message, 0, null);
  }
};
