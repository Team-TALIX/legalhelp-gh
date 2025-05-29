'use client';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = 'px-6 py-2.5 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-gray-700',
    ghost: 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-gray-700',
  };

  const disabledStyle = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? disabledStyle : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
