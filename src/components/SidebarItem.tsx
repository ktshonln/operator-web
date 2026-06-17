import { useState } from "react";
import { IconType } from "react-icons";
import { Link, useLocation } from "react-router-dom";

interface Props {
  link: string;
  label: string;
  Icon: IconType;
  subLinks?: string[];
  show: boolean;
  activePrefix?: string; // optional override for active detection
  onItemClick?: () => void;
}

const SidebarItem = ({ link, label, Icon, subLinks, show, activePrefix, onItemClick }: Props) => {
  const path = useLocation().pathname;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const prefix = activePrefix ?? link;
  const isActive = path === prefix || path.startsWith(prefix + "/");

  return (
    <div>
      <Link
        to={subLinks ? link + subLinks[0] : link}
        onClick={onItemClick}
        className={`flex items-center justify-items-start p-1.5 gap-3 text-brand ${
          isActive ? "bg-brand text-white" : ""
        } hover:bg-brand hover:text-white mb-2 ${show ? "w-full" : "w-fit"} md:w-full rounded-sm`}
      >
        <Icon size={18} />
        <p className={`${show ? "" : "hidden"} md:block font-semibold text-sm`}>
          {label}
        </p>
      </Link>
      {subLinks && isActive && (
        <div className="text-[#6A717D] font-medium border-l border-gray-300 dark:border-gray-600 pt-5 pb-5 space-y-2 text-sm ml-2 md:ml-9 mb-2">
          {subLinks.map((sub, i) => (
            <div key={sub} className="flex items-center">
              {(hoveredIndex === i || path.includes(sub)) && (
                <div className="w-2 border-2 -ml-1 rounded-full border-white dark:border-black h-5 bg-brand" />
              )}
              <Link
                to={link + sub}
                onClick={onItemClick}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`ml-1 hover:text-brand ${path.includes(sub) && "text-brand"}`}
              >
                {sub.slice(1, 2).toUpperCase() + sub.slice(2)}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
