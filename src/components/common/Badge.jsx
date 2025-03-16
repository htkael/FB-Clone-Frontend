import React from "react";

const Badge = ({ count, className = "", size = "md", variant = "danger" }) => {
  if (!count || count <= 0) return null;

  const sizeClasses = {
    xs: "min-w-[1rem] h-[1rem] text-[0.65rem] px-1",
    sm: "min-w-[1.25rem] h-[1.25rem] text-[0.7rem] px-1",
    md: "min-w-[1.5rem] h-[1.5rem] text-xs px-1.5",
    lg: "min-w-[1.75rem] h-[1.75rem] text-xs px-1.5",
    xl: "min-w-[2rem] h-[2rem] text-sm px-2",
  };

  const variantClasses = {
    danger:
      "bg-red-500 dark:bg-red-600 text-white shadow-sm shadow-red-500/20 dark:shadow-red-600/20",
    warning:
      "bg-amber-500 dark:bg-amber-600 text-white shadow-sm shadow-amber-500/20 dark:shadow-amber-600/20",
    success:
      "bg-green-500 dark:bg-green-600 text-white shadow-sm shadow-green-500/20 dark:shadow-green-600/20",
    info: "bg-blue-500 dark:bg-blue-600 text-white shadow-sm shadow-blue-500/20 dark:shadow-blue-600/20",
    primary:
      "bg-indigo-500 dark:bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 dark:shadow-indigo-600/20",
    secondary:
      "bg-gray-500 dark:bg-gray-600 text-white shadow-sm shadow-gray-500/20 dark:shadow-gray-600/20",
  };

  const displayCount = count > 99 ? "99+" : count;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium leading-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      style={{
        textRendering: "geometricPrecision",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {displayCount}
    </span>
  );
};

export default Badge;
