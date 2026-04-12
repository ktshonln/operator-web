import { BiHomeAlt, BiSolidUserCircle, BiTrip } from "react-icons/bi";
import SidebarItem from "./SidebarItem";
import { BsTicket, BsBuilding } from "react-icons/bs";
import { RiBusFill } from "react-icons/ri";
import { FaChartLine } from "react-icons/fa6";
import { FiSettings } from "react-icons/fi";
import { IconType } from "react-icons";
import { HiOutlineLogout } from "react-icons/hi";
import useUser from "../hooks/useUser";
import { camelCaseToTitle } from "../utils/helpers";
import useLogout from "../hooks/useLogout";
import { useMenuStore } from "../stores/menuStore";
import { AiOutlineClose } from "react-icons/ai";
import { Can } from "../contexts/AbilityContext";

const Sidebar = () => {
  const { user } = useUser();
  const logout = useLogout();
  const pages: {
    link: string;
    icon: IconType;
    subLinks?: string[];
    action: string;
    subject: string;
  }[] = [
    { link: "/home", icon: BiHomeAlt, action: "read", subject: "all" },
    {
      link: "/organizations",
      icon: BsBuilding,
      action: "read",
      subject: "Organization",
    },
    { link: "/ticketing", icon: BsTicket, action: "read", subject: "Ticket" },
    {
      link: "/fleets",
      icon: RiBusFill,
      subLinks: ["/buses", "/drivers"],
      action: "read",
      subject: "Bus",
    },
    { link: "/trips", icon: BiTrip, action: "read", subject: "Trip" },
    { link: "/reports", icon: FaChartLine, action: "read", subject: "Report" },
    { link: "/settings", icon: FiSettings, action: "read", subject: "User" },
  ];
  const { show, hideMenu } = useMenuStore();
  return (
    <div
      className={`relative min-w-20 md:min-w-56 ${show ? "w-0" : "hidden"} sm:block`}
    >
      {show && (
        <div
          onClick={hideMenu}
          className="bg-black/50 dark:bg-neutral-900/70 fixed inset-0 z-50"
        />
      )}
      <div
        className={`z-50 fixed top-0 min-w-20 md:min-w-56 ${show ? "min-w-56" : ""}  p-3 h-screen flex flex-col justify-between shadow-lg rounded-r-md bg-white dark:bg-neutral-900 shadow-black/15`}
      >
        <div className="relative dark:text-white">
          {show && (
            <AiOutlineClose
              onClick={hideMenu}
              title="Close sidebar"
              className="absolute right-0 cursor-pointer"
            />
          )}

          <div className="w-fit mx-auto">
            <img
              src="/logoOne.svg"
              className="w-32 dark:invert"
              alt="Katisha-logo"
            />
          </div>
          <div
            className={`mt-8 mx-auto ${show ? "w-full" : "w-fit"} md:w-full`}
          >
            {pages.map((page) => (
              <Can
                key={page.link}
                I={page.action as any}
                a={page.subject as any}
              >
                <SidebarItem
                  show={show}
                  Icon={page.icon}
                  link={page.link}
                  subLinks={page.subLinks}
                />
              </Can>
            ))}
          </div>
        </div>
        <div className="mb-3 w-fit mx-auto md:w-full">
          <div className="flex items-center gap-2">
            <div>
              <BiSolidUserCircle size={40} className="text-neutral-400" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm dark:text-white">
                {user?.first_name + " " + user?.last_name}
              </p>
              <p className="text-xs text-[#6A717D]">
                {user && "roles" in user
                  ? camelCaseToTitle(user.roles?.[0] ?? "")
                  : ""}
              </p>
            </div>
          </div>
          <div
            onClick={() => logout.mutate()}
            className="flex items-center group gap-3 ml-3 text-neutral-500 mt-3 hover:text-black dark:hover:text-white cursor-pointer active:scale-95"
          >
            <HiOutlineLogout className="group-active:translate-x-2" size={18} />
            <p className="font-semibold text-sm hidden md:block">Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
