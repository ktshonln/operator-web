import { ReactElement } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../errors/ErrorFallback";
import useUser from "../../hooks/useUser";

interface Props {
  children?: ReactElement;
}
const Layout = ({ children }: Props) => {
  const navigate = useNavigate();
  const user = useUser();
  // if (!user) navigate("/login");
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
