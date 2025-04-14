import { ReactElement } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

 interface Props {
    children?: ReactElement
} 
const Layout = ({children}:Props) => {
    return (
        <div className="font-heebo">
          <div className="flex">
      <Sidebar/>
      <div className="w-full ml-3 mt-5">
        {children}
        <Outlet/>
      </div>
    </div>
        </div>
    )
}

export default Layout