import { CgMenuLeft } from "react-icons/cg";
import { useMenuStore } from "../stores/menuStore";
import { MdOutlineWidgets } from "react-icons/md";
import { useLocation } from "react-router-dom";

const Header = () => {
  const {
    show,
    show2,
    showMenu2,
    showMenu,
  } = useMenuStore();
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/home";

  return (
    <div className={`print-hide dark:text-white flex justify-between sm:hidden p-5 pb-0`}>
      {!show && (
        <CgMenuLeft size={20} onClick={showMenu} className="cursor-pointer" />
      )}
      {!show2 && isHome && (
        <MdOutlineWidgets
          size={20}
          onClick={showMenu2}
          className="cursor-pointer"
        />
      )}
    </div>
  );
};

export default Header;
