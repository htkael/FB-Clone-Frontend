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
    const { data, status } = error.response;
    const message = data.message || "Something went wrong with the request";

    if (status === 401) {
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
    throw new ApiError(
      "No response from server. Please check your internet connection.",
      0,
      null
    );
  } else {
    throw new ApiError(error.message, 0, null);
  }
};
