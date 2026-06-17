import { CgMenuLeft } from "react-icons/cg";
import { useMenuStore } from "../stores/menuStore";
import { MdOutlineWidgets } from "react-icons/md";

const Header = () => {
  const {
    show,
    show2,
    showMenu2: showMenu2,
    showMenu,
  } = useMenuStore();
  return (
    <div className={`print-hide dark:text-white flex justify-between sm:hidden p-5 pb-0`}>
      {!show && (
        <CgMenuLeft size={20} onClick={showMenu} className="cursor-pointer" />
      )}
      {!show2 && (
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
