import { ReactElement } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

 interface Props {
    children?: ReactElement
} 
const Layout = ({children}:Props) => {
    return (
        <div className="font-heebo mb-5">
          <div className="flex">
      <Sidebar/>
      <div className="w-full">
        {children}
        <Outlet/>
      </div>
    </div>
        </div>
    )
}

export default Layout