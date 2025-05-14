import { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { camelCaseToTitle } from "../utils/helpers";
import useBuses, { BusQuery } from "../hooks/useBuses";
import useUser from "../hooks/useUser";
import AddBus from "../components/AddBus";

const tableData = [
  {busId: '123413i2i',busType: 'Yutong large', plateNumber: 'RAC 229 A', seatCapacity: '55', driver: 'Gasana Innocent', status: 'available'},
  {busId: '123413i2i',busType: 'Yutong large', plateNumber: 'RAC 229 A', seatCapacity: '55', driver: 'Gasana Innocent', status: 'available'},
  {busId: '123413i2i',busType: 'Yutong large', plateNumber: 'RAC 229 A', seatCapacity: '55', driver: 'Gasana Innocent', status: 'available'},
]



function Buses() {
  const [addBus, setAddBus] = useState(false)
  const { user } = useUser();
  const companyId = user.companyId
  const {data:buses} = useBuses(companyId,{} as BusQuery)
  const tableHeaders = Object.keys(tableData[0]);
  console.log(tableHeaders);
  const navigate = useNavigate()
  console.log('Buses BABY', buses)

  return  <div className="mt-5 m-5 ml-3">
  <div className="flex items-center space-x-3 p-3 border-1 border-neutral-200 rounded-xl text-sm max-w-2xl">
          <AiOutlineSearch size={20} />
          <form action="">
            <input
              type="text"
              placeholder="Enter  destination..."
              className="placeholder:text-brand2 outline-none"
            />
          </form>
        </div>
          <div className="mt-7">
            <p onClick={() => setAddBus(true)} className="text-brand justify-self-end text-sm cursor-pointer">+Add Bus</p>
          </div>
            <div className="w-full mt-7 overflow-x-hidden">
              <table className="text-sm gap-x-2 w-full">
                <thead>

                <tr className="gap-2">
                  <th className="bg-gray-100   text-start p-1 pb-4 pr-3 pl-3">#</th>
                  {tableHeaders.filter(h=>h!=='busId').map((header) => (// if some unnecessary headers are present, we can filter them out, e.g: with [includes]
                    <th className="bg-gray-100   text-start p-1 pb-4 pr-3 pl-3">
                      {camelCaseToTitle(header).toLocaleUpperCase()}
                    </th>
                  ))}
                </tr>
                </thead>
                <tbody>

                {buses?.map(
                  ({ busId,  brand, plateNumber, seatingCapacity,  status }, i) => {
                    const driver = 'Gasana';
                    return(
                    <tr key={busId+i} onClick={()=>{navigate(`/fleets/buses/${busId}`)}} className={`even:bg-gray-100 text-neutral-500 hover:bg-gray-200 cursor-pointer`}>
                      <td className="p-3">{i+1}</td>
                      <td className="p-3">{brand}</td>
                      <td className="p-3">{plateNumber}</td>
                      <td className="p-3">
                        {seatingCapacity}
                      </td>
                      <td className="p-3">
                        {driver}
                      </td>
                      <td className="p-3">{status}</td>
                    </tr>
                  )}
                )}
                </tbody>
              </table>
            </div>
            {addBus && <AddBus companyId={companyId} effectTwo={() => setAddBus(false)} />}
</div>;
}

export default Buses;
