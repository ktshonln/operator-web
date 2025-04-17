import { ReactElement } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

 interface Props {
    children?: ReactElement
} 
const Layout = ({children}:Props) => {
    return (
        <div className="font-heebo flex mb-5">
      <Sidebar/>
      <main className="w-full">
        {children}
        <Outlet/>
      </main>
        </div>
    )
}

export default Layout