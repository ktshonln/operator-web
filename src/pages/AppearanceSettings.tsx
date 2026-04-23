import SettingsNav from "../components/SettingsNav";
import ThemeToggle from "../components/ThemeToggle";

function AppearanceSettings() {
  return (
    <div className="px-4 py-6">
      <div className="max-w-2xl">
        <SettingsNav />
        <div className="mb-6">
          <h1 className="font-bold text-2xl">Appearance</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Customize how the application looks for you.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1">Theme</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Choose between light and dark mode.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default AppearanceSettings;
