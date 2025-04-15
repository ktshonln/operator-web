import { BiCalendarAlt } from "react-icons/bi";
import DropDown from "./DropDown";
const Filter = () => {
  const filterOptions = [
    "Today",
    "Yesterday",
    "This week",
    "This month",
    "Select Date",
  ];
  const branches = ["All branches", "branch 1", "branch 2", "branch 3"];

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
          <p>{option}</p>
        </div>
      ))}

      <DropDown options={branches} />
    </div>
  );
};

export default Filter;
