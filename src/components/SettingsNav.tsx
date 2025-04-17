import { Link, useLocation } from "react-router-dom";

const SettingsNav = () => {
  const path = useLocation().pathname;

    return (
        <div className="flex space-x-4 text-sm font-semibold items-baseline mb-5 text-brand2">
        <Link to="/settings"  className={`${(path === "/settings"||path.includes("/settings/user")) && "text-brand"} cursor-pointer`}>
          General
        </Link>
        <Link to='/settings/profile'
          className={`${
            path.includes("/settings/profile") && "text-brand"
          } cursor-pointer`}
        >
          Profile
        </Link>
        <Link to='/settings/security'
          className={`${
            path.includes("/settings/security") && "text-brand"
          } cursor-pointer`}
        >
          Security
        </Link>
      </div>
    )
}

export default SettingsNav
