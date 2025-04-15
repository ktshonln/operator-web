import { useState } from "react";
import { BiChevronDown } from "react-icons/bi";

interface Props {
    options: string[];
    style?: 'v1' | 'v2';
}
const DropDown = ({options, style}:Props) => {
    // const options = ['All branches','branch 1', 'branch 2', 'branch 3']
          const [branchChoice, setBranchChoice] = useState(options[0]);
          const [showChoice, setShowChoice] = useState(false);
    return (
        <div className="relative w-fit">
                  <div
                    onClick={() => setShowChoice(!showChoice)}
                    className={`flex items-center cursor-pointer ${style==='v1'?'justify-between w-full bg-red-400':''}`}
                  >
                    <p className="text-brand">{branchChoice}</p>
                    <BiChevronDown size={15} />
                  </div>
                  {showChoice && (
                    <div className="absolute top-5 border-1 border-neutral-200 shadow-md rounded-md p-1 bg-white z-10">
                     {options.map(branch=>
                     <p key={branch} onClick={()=>{
                        setBranchChoice(branch)
                        setShowChoice(false)}} 
                        className="hover:bg-brand hover:text-white p-1 rounded-md cursor-pointer text-nowrap">{branch}</p>
                     )}
                    </div>
                  )}
                </div>
    )
}

export default DropDown
