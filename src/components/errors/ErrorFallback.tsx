import { useNavigate } from "react-router-dom";
import { BiSolidConfused } from "react-icons/bi";

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const navigate = useNavigate();

  return (
    <div className="font-heebo flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <BiSolidConfused className="text-red-400 mb-4" size={64} />
      <h2 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 max-w-md">
        This page ran into an error. The rest of the app is still working.
      </p>
      <p className="text-xs text-red-500 mb-8 max-w-md font-mono bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
        {error.message}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => { navigate("/home"); resetErrorBoundary(); }}
          className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Go to Home
        </button>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
