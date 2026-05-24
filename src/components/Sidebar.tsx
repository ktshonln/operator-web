import { BiHomeAlt, BiSolidUserCircle, BiTrip } from "react-icons/bi";
import { MdLocationOn, MdAttachMoney } from "react-icons/md";
import { TbRoute } from "react-icons/tb";
import SidebarItem from "./SidebarItem";
import { buildCdnUrl } from "../services/apiClient";
import { BsBuilding } from "react-icons/bs";
import { RiBusFill } from "react-icons/ri";
import { FaChartLine } from "react-icons/fa6";
import { FiSettings } from "react-icons/fi";
import { HiOutlineUserGroup, HiOutlineLogout } from "react-icons/hi";
import { IconType } from "react-icons";
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
    label: string;
    icon: IconType;
    subLinks?: string[];
    activePrefix?: string;
    action: string;
    subject: string;
  }[] = [
    { link: "/home",            label: "Home",          icon: BiHomeAlt,         action: "read", subject: "all" },
    { link: "/organizations",   label: "Organizations", icon: BsBuilding,        action: "read", subject: "Organization" },
    { link: "/fleets",          label: "Fleets",        icon: RiBusFill,         subLinks: ["/buses", "/drivers"], action: "read", subject: "Bus" },
    { link: "/trips",           label: "Trips",         icon: BiTrip,            action: "read", subject: "Trip" },
    { link: "/locations",       label: "Locations",     icon: MdLocationOn,      action: "read", subject: "Location" },
    { link: "/routes",          label: "Routes",        icon: TbRoute,           action: "read", subject: "Route" },
    { link: "/prices",          label: "Prices",        icon: MdAttachMoney,     action: "read", subject: "Price" },
    { link: "/reports",         label: "Reports",       icon: FaChartLine,       action: "read", subject: "Report" },
    { link: "/team",            label: "Team",          icon: HiOutlineUserGroup, subLinks: ["/users", "/roles", "/invitations"], action: "read", subject: "User" },
    { link: "/settings/profile", label: "Settings",    icon: FiSettings,        activePrefix: "/settings/p", action: "read", subject: "User" },
  ];

  const { show, hideMenu } = useMenuStore();

  return (
    <div className={`relative min-w-20 md:min-w-56 ${show ? "w-0" : "hidden"} sm:block`}>
      {show && (
        <div
          onClick={hideMenu}
          className="bg-black/50 dark:bg-neutral-900/70 fixed inset-0 z-50"
        />
      )}

      <div
        className={`z-50 fixed top-0 min-w-20 md:min-w-56 ${show ? "min-w-56" : ""} p-3 h-screen flex flex-col shadow-lg rounded-r-md bg-white dark:bg-neutral-900 shadow-black/15`}
      >
        {/* ── Logo ── */}
        <div className="relative shrink-0 dark:text-white">
          {show && (
            <AiOutlineClose
              onClick={hideMenu}
              title="Close sidebar"
              className="absolute right-0 cursor-pointer"
            />
          )}
          <div className="w-[42px] md:w-32 mx-auto overflow-hidden">
            <img
              src="/logoOne.svg"
              className="w-32 max-w-none md:w-full object-left object-cover dark:invert"
              alt="Katisha-logo"
            />
          </div>
        </div>

        {/* ── Nav items — scrollable ── */}
        <div
          className={`mt-8 flex-1 overflow-y-auto no-scrollbar mx-auto ${show ? "w-full" : "w-fit"} md:w-full`}
        >
          {pages.map((page) => (
            <Can key={page.link} I={page.action as any} a={page.subject as any}>
              <SidebarItem
                show={show}
                Icon={page.icon}
                link={page.link}
                label={page.label}
                subLinks={page.subLinks}
                activePrefix={page.activePrefix}
              />
            </Can>
          ))}
        </div>

        {/* ── User + logout ── */}
        <div className="mb-3 shrink-0 w-fit mx-auto md:w-full">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {user?.avatar_path ? (
                <img
                  src={buildCdnUrl(user.avatar_path) ?? user.avatar_path}
                  alt={user.first_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <BiSolidUserCircle size={40} className="text-neutral-400" />
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm dark:text-white">
                {user?.first_name + " " + user?.last_name}
              </p>
              <p className="text-xs text-[#6A717D]">
                {user && "roles" in user ? camelCaseToTitle(user.roles?.[0] ?? "") : ""}
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

        <p
          title={new Date(__BUILD_DATE__).toLocaleString()}
          className="absolute text-[10px] text-white dark:text-neutral-900 hover:text-neutral-500 bottom-0"
        >
          v {new Date(__BUILD_DATE__).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
