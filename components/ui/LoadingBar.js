export default function LoadingBar({ progress = 0 }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
      <div
        className="bg-orange-600 dark:bg-orange-500 h-1.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      ></div>
    </div>
  );
}
