export default function Spinner({ size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`animate-spin rounded-full border-4  border-orange-600 dark:border-orange-500 border-t-transparent ${
        sizeClasses[size] || sizeClasses.md
      }`}
    ></div>
  );
}
