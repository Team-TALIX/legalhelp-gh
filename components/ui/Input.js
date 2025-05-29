import React from "react";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  icon: IconComponent, // Changed prop name for clarity
  onIconClick,
  disabled, // Added disabled prop
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled} // Pass disabled to input
          className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
            IconComponent ? "pr-10" : ""
          } ${className}`}
        />
        {IconComponent && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            style={{ top: label ? "0.625rem" : "0" }} // Adjust based on label presence to better align with input text
          >
            <button
              type="button"
              onClick={onIconClick}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              aria-label={
                type === "password" ? "Show password" : "Hide password"
              } // More specific label
              disabled={disabled} // Disable button if input is disabled
            >
              <IconComponent className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
