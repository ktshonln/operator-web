import { useEffect, useState } from "react";
import { BiCalendarAlt } from "react-icons/bi";
import { Branch } from "../pages/ProfileSettings";
import { camelCaseToTitle, getDateRange } from "../utils/helpers";
import CustomDatePicker from "./CustomDatePicker";
import DropDown from "./DropDown";
import { format } from "date-fns";
import { Role } from "../hooks/useUser";
interface Props {
  onSelectFilter: (filter: Filter)=>void;
  branches?:string[];
  userRole?: Role;
}
interface Filter {
  startDate: string;
  endDate: string;
  branch?: Branch;
}
// const fullFilter = 
const Filter = ({onSelectFilter, branches=[], userRole}:Props) => {
  const [clicked, setClicked] = useState(0)
  const [currentFilter, setCurrentFilter] = useState<Filter>({
    startDate: '',
    endDate: ''
  })
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState<Date|[Date,Date]|null>(null);
  const filterOptions = [
    "Today",
    "Yesterday",
    "This week",
    "This month",
    "Select Date",
  ];
  // const branches = ["All branches", "branch 1", "branch 2", "branch 3"];
  type FilterOptions =  "today" | "yesterday" | "thisWeek" | "thisMonth"

   useEffect(()=>{
     onSelectFilter(getDateRange('today')) // Making today the default filter query
  },[]) 

  const handleClick =(option:FilterOptions)=>{
    const result = getDateRange(option)
    console.log('Before: ', option)
    console.log('After',result)
    setCurrentFilter({...currentFilter, startDate:result.startDate, endDate: result.endDate})
    onSelectFilter({...currentFilter, startDate:result.startDate, endDate: result.endDate})
  }

  const handleSelectDate  = (val:Date|[Date,Date]|null)=>{
    const result = {startDate:'', endDate:""}
    if(!val) return 
    if (Array.isArray(val))
    {
      result.startDate = `${format(val[0], 'yyyy-MM-dd')}`; result.endDate= `${format(val[1], 'yyyy-MM-dd')}`
    }
    else result.startDate = result.endDate = `${format(val, 'yyyy-MM-dd')}`; 

    setCurrentFilter({...currentFilter, startDate:result.startDate, endDate: result.endDate})
    onSelectFilter({...currentFilter, startDate:result.startDate, endDate: result.endDate})
  }
  

  return (
    <>
    <div className="flex items-center justify-between border rounded-xl border-neutral-200 dark:border-neutral-800 font-medium text-xs text-brand2 p-1 mt-2 relative">
      {filterOptions.map((option, i) => (
        <div
        onClick={()=>{setClicked(i);option!==filterOptions[4] ? handleClick(camelCaseToTitle(option, true) as FilterOptions):setOpen(!open)}}
          className={`${
            option === filterOptions[clicked] && "bg-brand text-white"
          } flex items-center space-x-0.5 p-1 pl-4 pr-4 rounded-lg cursor-pointer`}
        >
          {option === filterOptions[4] && (
            <BiCalendarAlt size={14} className="mb-0.5" />
          )}
          <p>{option=== filterOptions[4]  ? ( val ? Array.isArray(val)
            ? `${format(val[0], 'PP')} → ${format(val[1], 'PP')}`
            : format(val, 'PP') :option ) :option}</p>
        </div>
      ))}
      
        <div className="absolute right-0 z-20 top-5">
     <CustomDatePicker
         mode="mixed"
         isOpen={open}
         onClose={()=> setOpen(false)}
         onChange={
          (selectedVal)=>{handleSelectDate(selectedVal);

            setVal(selectedVal)
          }
        }
        />
          {/* <DatePicker selected={startDate} onChange={handleChange} inline /> */}
        </div>
  

      {userRole==='admin' &&<DropDown onSelect={(choice)=>{
        setCurrentFilter({...currentFilter, branch:{name: choice}});
        onSelectFilter({...currentFilter, branch:{name: choice}});
      }} options={['All branches',...branches]} />}
    </div>
    
    </>
  );
};

export default Filter;
