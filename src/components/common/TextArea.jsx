import React, { forwardRef } from "react";

const TextArea = forwardRef(
  (
    {
      label,
      name,
      error,
      className = "",
      placeholder,
      required = false,
      rows = 4,
      helperText,
      maxLength,
      showCount = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(props.value?.length || 0);

    const handleChange = (e) => {
      setCharCount(e.target.value.length);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const disabledStyles = disabled
      ? "bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
      : "bg-white dark:bg-gray-900";

    return (
      <div className="mb-4">
        {label && (
          <div className="flex justify-between mb-1.5">
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {label}
              {required && (
                <span className="text-red-500 dark:text-red-400 ml-1">*</span>
              )}
            </label>

            {showCount && maxLength && (
              <span
                className={`text-xs ${
                  charCount > maxLength
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={name}
          name={name}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          onChange={showCount ? handleChange : props.onChange}
          className={`
            block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            dark:focus:ring-blue-400 dark:focus:border-blue-400
            resize-y min-h-[80px] transition-colors duration-200
            ${
              error
                ? "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400"
                : "border-gray-300 dark:border-gray-600"
            }
            ${disabledStyles}
            ${className}
          `}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${name}-error` : helperText ? `${name}-helper` : undefined
          }
          {...props}
        />

        {/* Show character count at bottom for textarea without label */}
        {showCount && maxLength && !label && (
          <div className="flex justify-end mt-1">
            <span
              className={`text-xs ${
                charCount > maxLength
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {charCount}/{maxLength}
            </span>
          </div>
        )}

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

TextArea.displayName = "TextArea";

export default TextArea;
