import { Link, useLocation } from "react-router-dom";

const teamNavItems = [
  { label: "Users", to: "/team/users", match: (p: string) => p === "/team/users" || p.startsWith("/team/user/") },
  { label: "Roles", to: "/team/roles", match: (p: string) => p.startsWith("/team/roles") },
];

const personalNavItems = [
  { label: "Profile", to: "/settings/profile", match: (p: string) => p.startsWith("/settings/profile") },
  { label: "Security", to: "/settings/security", match: (p: string) => p.startsWith("/settings/security") },
  { label: "Appearance", to: "/settings/appearance", match: (p: string) => p.startsWith("/settings/appearance") },
];

const SettingsNav = () => {
  const path = useLocation().pathname;
  const isTeamSection = path.startsWith("/team/");
  const items = isTeamSection ? teamNavItems : personalNavItems;

  return (
    <div className="flex space-x-5 text-sm font-semibold items-baseline mb-5 text-brand2">
      {items.map(({ label, to, match }) => (
        <Link
          key={to}
          to={to}
          className={`transition-colors cursor-pointer ${match(path) ? "text-brand" : "hover:text-brand"}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
};

export default SettingsNav;
