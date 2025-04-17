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
        <div className="relative ">
                  <div
                    onClick={() => setShowChoice(!showChoice)}
                    className={`flex items-center cursor-pointer ${(style==='v1' || style==='v2')?'space-x-10  w-full justify-between':''}`}
                  >
                    <p className={`${style && ['v1' , 'v2'].includes(style) ?'text-black': 'text-brand'}`}>{branchChoice}</p>
                    <BiChevronDown size={15} />
                  </div>
                  {showChoice && (
                    <div className={`absolute top-5 right-0 border-1 bg-white border-neutral-200 shadow-md rounded-md p-1bg-white z-10 ${style==='v1'&& 'w-full mt-1'}`}>
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
