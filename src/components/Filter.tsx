import { useState } from "react";
import { BiCalendarAlt, BiChevronDown } from "react-icons/bi";
const Filter = () => {
    const filterOptions = [
        "Today",
        "Yesterday",
        "This week",
        "This month",
        "Select Date",
      ];
      const branches = ['All branches','branch 1', 'branch 2', 'branch 3']
      const [brandChoice, setBranchChoice] = useState(branches[0]);
      const [showChoice, setShowChoice] = useState(false);
    return (
        <div className="flex items-center justify-between border rounded-xl border-neutral-200 font-medium text-xs text-brand2 p-1 mt-2 ">
        {filterOptions.map((option) => (
          <div
            className={`${
              option === filterOptions[0] && "bg-brand text-white"
            } flex items-center space-x-0.5 p-1 pl-4 pr-4 rounded-lg `}
          >
            {option === filterOptions[4] && (
              <BiCalendarAlt size={14} className="mb-0.5" />
            )}
            <p>
              {option}
            </p>
          </div>
        ))}
        <div className="relative w-fit">
          <div
            onClick={() => setShowChoice(!showChoice)}
            className="relative flex items-center cursor-pointer "
          >
            <p className="text-brand">{brandChoice}</p>
            <BiChevronDown size={15} />
          </div>
          {showChoice && (
            <div className="absolute top-5 border-1 border-neutral-200 shadow-md rounded-md p-1 bg-white z-10">
             {branches.map(branch=>
             <p key={branch} onClick={()=>{
                setBranchChoice(branch)
                setShowChoice(false)}} 
                className="hover:bg-brand hover:text-white p-1 rounded-md cursor-pointer text-nowrap">{branch}</p>
             )}
            </div>
          )}
        </div>
        <div></div>
      </div>
    )
}

export default Filter
