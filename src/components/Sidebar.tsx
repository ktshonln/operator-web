import { BiHomeAlt, BiSolidUserCircle, BiTrip } from "react-icons/bi";
import SidebarItem from "./SidebarItem"
import { BsTicket } from "react-icons/bs";
import { RiBusFill } from "react-icons/ri";
import { FaChartLine } from "react-icons/fa6";
import { FiSettings } from "react-icons/fi";
import { IconType } from "react-icons";
import { HiOutlineLogout } from "react-icons/hi";
import useUser from "../hooks/useUser";
import { camelCaseToTitle } from "../utils/helpers";
import useLogout from "../hooks/useLogout";

const Sidebar = () => {
    const {user} = useUser()
    const logout = useLogout()
    const pages: { link: string; icon: IconType; subLinks?:string[] }[] = [
        { link: "/home", icon: BiHomeAlt },
        { link: "/ticketing", icon: BsTicket },
        { link: "/fleets", icon: RiBusFill, subLinks: ['/buses', '/drivers'] },
        { link: "/trips", icon: BiTrip },
        { link: "/reports", icon: FaChartLine },
        { link: "/settings", icon: FiSettings },
      ];
    return (
        <div className="relative w-1/5">

        <div className="fixed top-0 w-52 p-3 h-screen flex flex-col justify-between shadow-lg rounded-r-md dark:bg-neutral-900 shadow-black/15">
            <div className="">

            <div className="w-fit mx-auto">
            <img
              src="/logoOne.svg"
              className="w-16 dark:invert"
              alt="Katisha-logo"
            />
            </div>
            <div className="mt-8">
            {pages.map((page) => (
          <SidebarItem key={page.link} Icon={page.icon} link={page.link} subLinks={page.subLinks}/>
        ))}
            </div>
            </div>
            <div className="mb-3">
                <div className="flex items-center gap-2">
                    <div>
                        <BiSolidUserCircle size={40} className="text-neutral-400"/>
                    </div>
                    <div>
                        <p className="text-sm dark:text-white">{user.firstName + " " + user.lastName}</p>
                        <p className="text-xs text-[#6A717D]">{camelCaseToTitle(user.role??"")}</p>
                    </div>
                </div>
                    <div onClick={()=>logout()} className="flex items-center group gap-3 ml-3 text-neutral-500 mt-3 hover:text-black dark:hover:text-white cursor-pointer active:scale-95">
                        <HiOutlineLogout className="group-active:translate-x-2" size={18}/>
                        <p className="font-semibold text-sm">Logout</p>
                    </div>

            </div>
        </div>
        </div>
    )
}

export default Sidebar
