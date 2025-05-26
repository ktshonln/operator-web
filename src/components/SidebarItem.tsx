import { useState } from "react";
import { IconType } from "react-icons";
import { Link, useLocation } from "react-router-dom";

interface Props {
  link: string;
  Icon: IconType;
  subLinks?: string[];
  show: boolean;
}
const SidebarItem = ({ link, Icon, subLinks, show }: Props) => {
  const path = useLocation().pathname;
  console.log(link);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <div>
      <Link
        to={subLinks ? link + subLinks[0] : link}
        className={`flex items-center justify-items-start p-1.5 gap-3 text-brand ${
          path.includes(link) && "bg-brand  text-white"
        } hover:bg-brand hover:text-white mb-2 ${show?'w-full':'w-fit'} md:w-full rounded-sm `}
      >
        <Icon
          size={
            link === "/ticketing"
              ? "18px"
              : link === "/settings"
              ? "18px"
              : link === "/reports"
              ? "18px"
              : 21
          }
          className={`${link === "/ticketing" && "stroke-[.7px]"}`}
        />
        <p className={`${show?'':'hidden'} md:block font-semibold text-sm`}>
          {link.replace(
            `${link.slice(0, 2)}`,
            `${link.slice(1, 2).toUpperCase()}`
          )}
        </p>
      </Link>
      {subLinks && path.includes(link) && ( 
        <div className="text-[#6A717D] font-medium border-l border-gray-300 dark:border-gray-600 pt-5 pb-5 space-y-2 text-sm ml-2 md:ml-9 mb-2">
          {subLinks.map((sub, i) => (
            <div key={sub} className="flex items-center">
              {(hoveredIndex === i || path.includes(sub)) && (
                <div className="w-2 border-2 -ml-1 rounded-full border-white dark:border-black h-5 bg-brand" />
              )}
              <Link
                to={link + sub}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`ml-1 hover:text-brand ${
                  path.includes(sub) && "text-brand"
                }`}
              >
                {" "}
                {sub.replace(
                  `${sub.slice(0, 2)}`,
                  `${sub.slice(1, 2).toUpperCase()}`
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
