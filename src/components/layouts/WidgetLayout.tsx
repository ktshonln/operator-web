import { ReactElement } from "react";
import { Outlet } from "react-router-dom";

interface Props {
  children?: ReactElement;
}
function WidgetLayout({ children }: Props) {
  return (
    <div className="relative min-w-1/5 max-w-xl justify-self-end w-full flex">
      <div className="min-w-0 w-full max-w-xl  h-screen fixed top-0 right-0 self-stretch flex flex-col p-3 shadow-lg rounded-r-md shadow-black/15">
        {children}
        <Outlet />
      </div>
    </div>
  );
}

export default WidgetLayout;
