import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      error,
      className = "",
      placeholder,
      required = false,
      helperText,
      size = "md",
      leftIcon,
      rightIcon,
      rightIconClickable = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      sm: "px-2 py-1.5 text-xs",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base",
    };

    // Disabled state
    const disabledStyles = disabled
      ? "bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
      : "";

    return (
      <div className="mb-4 w-full">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
            {required && (
              <span className="text-red-500 dark:text-red-400 ml-1">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            id={name}
            name={name}
            disabled={disabled}
            className={`
              block w-full border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              dark:focus:ring-blue-400 dark:focus:border-blue-400
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              ${sizeClasses[size]}
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${
                error
                  ? "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              }
              ${disabledStyles}
              transition-colors duration-200
              ${className}
            `}
            placeholder={placeholder}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${name}-error`
                : helperText
                ? `${name}-helper`
                : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div
              className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                !rightIconClickable ? "pointer-events-none" : ""
              } text-gray-500 dark:text-gray-400`}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
            id={`${name}-error`}
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            className="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
            id={`${name}-helper`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

// Display name for debugging in React DevTools
Input.displayName = "Input";

export default Input;
