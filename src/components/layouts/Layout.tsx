import { ReactElement, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import ErrorFallback from "../errors/ErrorFallback";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { AbilityProvider } from "../../contexts/AbilityContext";
import useUser from "../../hooks/useUser";
import { useMenuStore } from "../../stores/menuStore";

interface Props {
  children?: ReactElement;
}
const Layout = ({ children }: Props) => {
  const { user } = useUser();
  const { hideMenu, hideMenu2 } = useMenuStore();

  useEffect(() => {
    // If the page is loaded on a mobile screen, make sure both sidebars are closed
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      hideMenu();
      hideMenu2();
    }
  }, [hideMenu, hideMenu2]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <AbilityProvider
      permissions={
        user && "permissions" in user ? (user.permissions as any) : []
      }
    >
      <div className="font-heebo flex">
        <Sidebar />
        <main className="w-full min-w-0 overflow-x-hidden">
          <Header />
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </AbilityProvider>
  );
};

export default Layout;
