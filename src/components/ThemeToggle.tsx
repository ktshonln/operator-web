import { AiOutlineSun } from "react-icons/ai"
import { HiOutlineDesktopComputer } from "react-icons/hi"
import { MdOutlineDarkMode } from "react-icons/md"
import { useTheme } from "../hooks/useTheme";

const ThemeToggle = () => {
    const [theme, setTheme] = useTheme();
    return (
         <div className="space-y-2">
                      <div
                        onClick={() => setTheme("system")}
                        className={`flex items-center space-x-5 text-sm cursor-pointer hover:text-black dark:hover:text-white ${
                          theme == "system" ? "text-black dark:text-white" : "text-neutral-500"
                        }`}
                      >
                        <div
                          className={`border rounded-full w-fit p-1.5 flex items-center justify-center ${
                            theme == "system" ? "border-brand" : "border-white"
                          }`}
                        >
                          <div>
                            <HiOutlineDesktopComputer size={15} />
                          </div>
                        </div>
                        <p>System</p>
                      </div>
                      <div
                        onClick={() => setTheme("light")}
                        className={`flex items-center space-x-5 text-sm cursor-pointer hover:text-black dark:hover:text-white ${
                          theme == "light" ? "text-black dark:text-white" : "text-neutral-500"
                        }`}
                      >
                        <div
                          className={`border rounded-full w-fit p-1.5 flex items-center justify-center ${
                            theme == "light" ? "border-brand" : "border-white"
                          }`}
                        >
                          <div>
                            <AiOutlineSun size={15} />
                          </div>
                        </div>
                        <p>Light</p>
                      </div>
                      <div
                        onClick={() => setTheme("dark")}
                        className={`flex items-center space-x-5 text-sm cursor-pointer hover:text-black dark:hover:text-white ${
                          theme == "dark" ? "text-black dark:text-white" : "text-neutral-500"
                        }`}
                      >
                        <div
                          className={`border rounded-full w-fit p-1.5 flex items-center justify-center ${
                            theme == "dark" ? "border-brand" : "border-white"
                          }`}
                        >
                          <div>
                            <MdOutlineDarkMode size={15} />
                          </div>
                        </div>
                        <p>Dark</p>
                      </div>
                    </div>
    )
}

export default ThemeToggle
