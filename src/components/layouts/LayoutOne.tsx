import { ReactElement } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import ErrorFallback from "../errors/ErrorFallback";
import Sidebar from "../Sidebar";

interface Props {
  children?: ReactElement;
}
const Layout = ({ children }: Props) => {

  return (
    <div className="font-heebo flex dark:bg-black">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Sidebar />
        <main className="w-full">
          {children}
          <Outlet />
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default Layout;
