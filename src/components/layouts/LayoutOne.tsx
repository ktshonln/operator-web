import { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../errors/ErrorFallback";

interface Props {
  children?: ReactElement;
}
const Layout = ({ children }: Props) => {
  return (
    <div className="font-heebo flex mb-5">
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
