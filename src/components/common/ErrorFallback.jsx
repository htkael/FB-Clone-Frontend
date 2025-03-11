import React from "react";
import Button from "./Button";

const ErrorFallback = ({
  error,
  resetErrorBoundary,
  message = "Something went wrong",
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-center">
        <svg
          className="h-16 w-16 text-red-500 mx-auto mb-4"
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
        <p className="text-gray-600 mb-6">
          {error?.message || "An unexpected error occurred"}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={resetErrorBoundary} variant="primary">
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/feed")}
            variant="outline"
          >
            Go to Feed
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
