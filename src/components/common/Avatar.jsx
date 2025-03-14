import React from "react";
import { getInitials, getRandomColor } from "../../utils/imageUtils";

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  xxl: "w-24 h-24 text-xl",
};

const ringClasses = {
  xs: "ring-1",
  sm: "ring-1",
  md: "ring-2",
  lg: "ring-2",
  xl: "ring-2",
  xxl: "ring-3",
};

const Avatar = ({
  src,
  alt,
  size = "md",
  className = "",
  onClick,
  isOnline,
  showBorder = true,
}) => {
  const [hasError, setHasError] = React.useState(false);

  // Parse the name for initials
  const names = alt ? alt.split(" ") : [""];
  const firstName = names[0] || "";
  const lastName = names.length > 1 ? names[names.length - 1] : "";
  const initials = getInitials(firstName, lastName);

  // Generate consistent background color
  const bgColor = getRandomColor(alt || "user");

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className="relative inline-block">
      <div
        className={`${
          sizeClasses[size]
        } rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 
        ${
          showBorder
            ? `${ringClasses[size]} ring-white dark:ring-gray-800 ring-offset-2 ring-offset-white dark:ring-offset-gray-900`
            : ""
        }
        ${
          onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""
        } ${className}`}
        onClick={onClick}
      >
        {!hasError && src ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="w-full h-full object-cover"
            onError={handleError}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: bgColor }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Online status indicator */}
      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800
          ${
            size === "xs"
              ? "w-1.5 h-1.5"
              : size === "sm"
              ? "w-2 h-2"
              : size === "md"
              ? "w-2.5 h-2.5"
              : size === "lg"
              ? "w-3 h-3"
              : size === "xl"
              ? "w-4 h-4"
              : "w-5 h-5"
          }`}
        >
          <span className="sr-only">Online</span>
        </span>
      )}
    </div>
  );
};

export default Avatar;
