import React from "react";

const variants = {
  primary:
    "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400",
  secondary:
    "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white dark:bg-gray-700 dark:hover:bg-gray-800 dark:focus:ring-gray-600",
  success:
    "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-400",
  danger:
    "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-400",
  warning:
    "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-500",
  outline:
    "bg-white hover:bg-gray-50 focus:ring-gray-300 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-gray-700",
  text: "bg-transparent hover:bg-gray-100 focus:ring-gray-300 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus:ring-gray-700",
  link: "bg-transparent underline hover:bg-transparent text-blue-600 hover:text-blue-800 p-0 dark:text-blue-400 dark:hover:text-blue-300 focus:ring-0",
};

const sizes = {
  xxs: "py-0.5 px-1 text-[10px]",
  xs: "py-1 px-2 text-xs",
  sm: "py-1.5 px-3 text-sm",
  md: "py-2 px-4 text-sm",
  lg: "py-2.5 px-5 text-base",
  xl: "py-3 px-6 text-lg",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  rounded = "md",
  ...props
}) => {
  // Handle rounded prop
  const roundedClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
      ? "rounded-lg"
      : rounded === "sm"
      ? "rounded-sm"
      : rounded === "none"
      ? "rounded-none"
      : "rounded-md";

  return (
    <button
      type={type}
      className={`
          font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
          ${variants[variant]}
          ${sizes[size]}
          ${roundedClass}
          ${fullWidth ? "w-full" : ""}
          ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""}
          ${className}
        `}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      <div
        className={`flex items-center justify-center gap-x-2 ${
          iconPosition === "right" ? "flex-row-reverse" : ""
        }`}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {icon && !isLoading && icon}
        {children && (
          <span
            className={icon ? (iconPosition === "right" ? "mr-0" : "ml-0") : ""}
          >
            {children}
          </span>
        )}
      </div>
    </button>
  );
};

export default Button;
