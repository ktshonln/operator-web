import { AiOutlineHistory, AiOutlineSearch } from "react-icons/ai"
import DropDown from "../components/DropDown"

function Ticketing() {
    const states = ['All', 'booked', 'unbooked']
    return (
        <div className="mt-5 m-5 ml-3">
            <div className="flex items-center space-x-3 p-3 border-1 border-neutral-200 rounded-xl text-sm max-w-2xl">
                <AiOutlineSearch size={20}/>
                <form action="">
                <input type="text" placeholder="Enter  destination..." className="placeholder:text-brand2 outline-none"/>
                    
                </form>
            </div>

            <div className="mt-3 text-sm text-brand flex justify-between">
            <button className=" cursor-pointer">+ Create trip</button>
            <div className="flex items-center">
                <AiOutlineHistory/>
            <button className="ml-1 cursor-pointer">View sold tickets</button>
            </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">

                <div className="border-1 border-neutral-200 rounded-sm w-fit p-1 pl-10 pr-10 text-sm text-neutral-500"><p>Kigali</p></div>
                <div className="border-1 border-neutral-200 rounded-sm w-fit p-1 pl-10 pr-10 text-sm "><p>RITCO</p></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="border-1 border-neutral-200 rounded-sm w-fit p-1 pl-10 pr-10 text-sm text-neutral-500">

                    <DropDown style={'v1'} options={states}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Ticketing
