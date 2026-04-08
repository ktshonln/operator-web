import { BiSolidConfused } from "react-icons/bi";

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="font-heebo">
      <div className="w-fit">
        <img src="/logoOne.svg" className="w-32 ml-5 mt-2 pt-5" alt="Katisha-logo" />
      </div>
      <div className="fixed w-full mt-20 text-center">
        <p className="font-black text-red-500 text-7xl mb-3 w-fit mx-auto">
          <BiSolidConfused />
        </p>
        <p className="font-semibold text-red-700 mb-5">Something went wrong</p>
        <p className="text-brand2  mb-10 ml-32 mr-32">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-brand text-white p-2 pl-8 pr-8 rounded-sm text-sm hover:opacity-90 font-semibold cursor-pointer  active:scale-95"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;

/* 
 
   <div className="p-4 border-2 border-red-500 w-full rounded-lg">
            <h2 className="text-lg font-semibold text-red-700">Something went wrong:</h2>
            <p className="my-2 text-sm text-red-600">{error.message}</p>
            <button className="bg-white rounded-lg cursor-pointer border p-1" onClick={resetErrorBoundary}>Try again</button>
        </div>
        
 */
