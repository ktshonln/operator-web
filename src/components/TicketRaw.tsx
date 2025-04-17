import { CgList } from "react-icons/cg";
import { RiBusFill } from "react-icons/ri";

interface Props {
  onClick: (ticketId: string) => void;
  viewList:()=>void;
}
const TicketRaw = ({ onClick, viewList }: Props) => {
  return (
    <div
      
      className="flex items-center justify-between drop-shadow-lg bg-white border border-neutral-200 p-3 pl-5 pr-5 mt-4 rounded-xl hover:bg-gray-100 hover:-translate-y-1"
    >
      <div onClick={() => onClick("1234D")} className="grow cursor-pointer">
        <p className="font-bold text-lg">Kigali - Nyamagabe</p>
        <p className="text-neutral-500">
          Departure:{" "}
          <span className="font-light text-black">1/4/2025 12H00</span>
        </p>
        <p className="text-neutral-500">
          Arrival: <span className="font-light text-black">1/4/2025 14H00</span>
        </p>
      </div>
      <div className="border-l border-neutral-200 pl-3">
        <div className="flex items-center space-x-2 text-xs mb-3">
          <button className="text-brand flex items-center space-x-1">
            <CgList size={18} />
            <p onClick={viewList} className="cursor-pointer">View Passenger List</p>
          </button>

          <div className="border rounded-full border-neutral-500 font-medium p-1 pt-0.5 pb-0.5 flex justify-center align-middle text-center items-center">
            <p>55</p>
          </div>
          <div className="bg-brand text-white rounded-full p-1 pl-3 pr-3 font-semibold">
            <p>Sold out</p>
          </div>
        </div>
        <p className="text-neutral-500">
          Price:{" "}
          <span className="font-medium text-lg text-black">2,630 RWF</span>
        </p>
        <div className="flex items-center space-x-1 text-sm">
          <RiBusFill size={20} />
          <p className="font-semibold">RAB 198 H, Yutong Large</p>
        </div>
      </div>
     
    </div>
  );
};

export default TicketRaw;
