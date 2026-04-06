import { ReactElement } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import ErrorFallback from "../errors/ErrorFallback";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { AbilityProvider } from "../../contexts/AbilityContext";
import useUser from "../../hooks/useUser";

interface Props {
  children?: ReactElement;
}
const Layout = ({ children }: Props) => {
  const { user } = useUser();

  if (!user) {
    return <div>Loading...</div>; // Or redirect, but since it's protected, assume user is there
  }

  return (
    <AbilityProvider permissions={user.permissions as any[]}>
      <div className="font-heebo flex">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Sidebar />
          <main className="w-full">
            <Header />
            {children}
            <Outlet />
          </main>
        </ErrorBoundary>
      </div>
    </AbilityProvider>
  );
};

export default Layout;
