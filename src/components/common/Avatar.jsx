import React from "react";
import { getInitials, getRandomColor } from "../../utils/imageUtils";

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
  xxl: "w-24 h-24 text-2xl",
};

const Avatar = ({ src, alt, size = "md", className = "", onClick }) => {
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
    <div
      className={`${
        sizeClasses[size]
      } rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
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
  );
};

export default Avatar;
