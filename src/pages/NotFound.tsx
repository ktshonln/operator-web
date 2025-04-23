import { Link } from "react-router-dom"

function NotFound() {
    return (
        <div className="font-heebo">
             <div className="w-fit">
            <img
              src="/logoOne.svg"
              className="w-16"
              alt="Katisha-logo"
            />
            </div>
            <div className=" mt-20 text-center">
                <p className="font-black text-[#1A202C] text-7xl mb-3">404</p>
                <p className="font-semibold  mb-5">Page not found!</p>
                <p className="text-brand2  mb-10">The page you are trying to access does not exist or has been removed.</p>
                <Link to='/home' className="bg-brand text-white p-2 pl-8 pr-8 rounded-sm text-sm hover:opacity-90 font-semibold active:scale-95">Go home</Link>
            </div>
        </div>
    )
}

export default NotFound
