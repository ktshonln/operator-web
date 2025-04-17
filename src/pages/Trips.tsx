import { BiCalendarAlt, BiCheck } from "react-icons/bi";
import DropDown from "../components/DropDown";
import WidgetLayout from "../layouts/WidgetLayout";
import {
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineSearch,
  AiTwotoneEdit,
} from "react-icons/ai";
import { useState } from "react";
import { formatMoney } from "../utils/helpers";

function Trips() {
  const data = [
    { destination: "Nyamagabe", price: 4250 },
    { destination: "Nyamagabe", price: 4250 },
    { destination: "Nyamagabe", price: 4250 },
    { destination: "Nyamagabe", price: 4250 },
  ];
  const [editRow, setEditRow] = useState<number | null>(null);
  const [deleteRow, setDeleteRow] = useState<number | null>(null);
  const [dVal, setDval] = useState<string | null>(null); // Destination value
  const [pVal, setPval] = useState<string | null>(null); // Price value
  return (
    <div className="flex  space-x-3">
      <div className=" ml-3 mt-5 grow ">
        <p className="font-bold text-lg w-fit mx-auto mb-3 ">Create Trip</p>
        <form className="text-sm">
          <p className="block mb-0.5 font-medium">Origin</p>
          <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
            <p className="text-neutral-500">Kigali</p>
          </div>
          <label htmlFor="destination" className="block mb-0.5 font-medium">
            Destination <span className="text-red-500 text-base">*</span>
          </label>

          <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
            <DropDown options={["seat1", "seat2"]} style="v1" />
          </div>
          <label htmlFor="bus" className="block mb-0.5 font-medium">
            Bus <span className="text-red-500 text-base">*</span>
          </label>
          <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
            <DropDown options={["seat1", "seat2"]} style="v1" />
          </div>
          <label htmlFor="departureTime" className="block mb-0.5 font-medium">
            Departure time <span className="text-red-500 text-base">*</span>
          </label>
          <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white flex items-center justify-between">
            <p>Choose date and time</p>
            <BiCalendarAlt size={14} />
          </div>
          <div className="text-sm font-medium flex items-center gap-14 mx-36">
            <button
              type="submit"
              className="bg-brand p-1.5 w-full text-white mt-10 rounded-xs cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      </div>
      <WidgetLayout>
        <div className="mr-10 w-full">
          <h2 className="font-bold mt-5 mb-5 w-fit mx-auto">
            Manage destinations
          </h2>
          <div className="flex items-center space-x-3 p-1 mb-3 border-1 border-neutral-200 rounded-full text-sm max-w-80">
            <AiOutlineSearch size={20} />
            <form action="" className="w-full mr-2">
              <input
                type="text"
                placeholder="Enter  destination..."
                className="placeholder:text-brand2 outline-none w-full"
              />
            </form>
          </div>

          <div className="w-full">
            <table className="text-sm w-full ">
              <tr>
                <th className=" text-start pl-5 pb-3">Destination</th>
                <th className=" text-start pb-3">Price(RWF)</th>
              </tr>
              {data.map(({ destination, price }, i) => (
                <tr className="text-brand2">
                  <div className="relative flex items-center gap-2 w-full">
                    {deleteRow === i && <hr className="absolute top-2.5 w-md"/>}
                      <td className="pb-3">
                        {editRow === i ? (
                          <div className="text-black ">
                            {i + 1}.{" "}
                            <input
                              onChange={(e) => {
                                setDval(e.target.value);
                              }}
                              type="text"
                              value={dVal || dVal === "" ? dVal : destination}
                              className="border border-neutral-400  rounded-sm pl-0.5  outline-none"
                            />
                          </div>
                        ) : (
                          `${i + 1}. ${destination}`
                        )}
                      </td>
                          </div>

                      <td className="pb-3">
                        {editRow === i ? (
                          <input
                            onChange={(e) => setPval(e.target.value)}
                            type="number"
                            value={pVal || pVal === "" ? pVal : price}
                            className="border border-neutral-400 w-16  rounded-sm pl-0.5 text-black outline-none"
                          />
                        ) : (
                          formatMoney(price)
                        )}
                      </td>
                  <td className="pb-3">
                    <div className="flex items-center space-x-2">
                      {editRow !== i && deleteRow !== i && (
                        <AiTwotoneEdit
                          size={15}
                          onClick={() => {
                            setDval(null);
                            setPval(null);
                            setEditRow(i);
                          }}
                          className="text-brand hover:scale-110 cursor-pointer"
                        />
                      )}
                      {editRow !== i && deleteRow !== i && (
                        <AiOutlineDelete
                          size={15}
                          onClick={() => setDeleteRow(i)}
                          className="text-[#FF6666] hover:scale-110 cursor-pointer"
                        />
                      )}
                      {(editRow === i || deleteRow === i) &&<BiCheck
                        size={20}
                        className="text-[#32CD32] hover:scale-110 cursor-pointer"
                      />}
                      {(editRow === i || deleteRow === i) &&<AiOutlineClose
                        onClick={() => {
                          setEditRow(null);
                          setDeleteRow(null);
                          setDval(null);
                          setPval(null);
                        }}
                        size={15}
                        className="text-[#FF6666] hover:scale-110 cursor-pointer"
                      />}
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="pl-4">
                  <input
                  
                    type="text"
                    className="border border-neutral-400  rounded-sm pl-0.5  outline-none"
                  />
                </td>
                <td>
                  <input
                   
                    type="number"
                    className="border border-neutral-400 w-16  rounded-sm pl-0.5 text-black outline-none"
                  />
                </td>
                <td className="text-brand cursor-pointer active:scale-95">
                    Add new
                </td>
              </tr>
            </table>
          </div>
        </div>
      </WidgetLayout>
    </div>
  );
}

export default Trips;
