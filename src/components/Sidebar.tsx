import { BiHomeAlt, BiSolidUserCircle, BiTrip } from "react-icons/bi";
import SidebarItem from "./SidebarItem"
import { BsTicket } from "react-icons/bs";
import { RiBusFill } from "react-icons/ri";
import { FaChartLine } from "react-icons/fa6";
import { FiSettings } from "react-icons/fi";
import { IconType } from "react-icons";
import { HiOutlineLogout } from "react-icons/hi";

const Sidebar = () => {
    const pages: { link: string; icon: IconType; subLinks?:string[] }[] = [
        { link: "/home", icon: BiHomeAlt },
        { link: "/ticketing", icon: BsTicket },
        { link: "/fleets", icon: RiBusFill, subLinks: ['/buses', '/drivers'] },
        { link: "/trips", icon: BiTrip },
        { link: "/reports", icon: FaChartLine },
        { link: "/settings", icon: FiSettings },
      ];
    return (
        <div className="w-1/5 p-3 h-screen flex flex-col justify-between shadow-lg rounded-r-md shadow-black/15">
            <div>

            <div className="w-fit mx-auto">
            <img
              src="/logoOne.svg"
              className="w-16"
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
                        <p className="text-sm">Alicia Kunda</p>
                        <p className="text-xs text-[#6A717D]">Agent</p>
                    </div>
                </div>
                    <div className="flex items-center gap-3 ml-3 text-neutral-500 mt-3">
                        <HiOutlineLogout size={18}/>
                        <p className="font-semibold text-sm">Logout</p>
                    </div>

            </div>
        </div>
    )
}

export default Sidebar
