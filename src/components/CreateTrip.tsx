import { BiCalendarAlt } from "react-icons/bi"
import DropDown from "./DropDown"
import Modal from "./Modal"
const CreateTrip = ({effectTwo}:{effectTwo:()=>void}) => {
    return (
        <Modal
          title="Create trip"
          actionOne="Create"
          actionTwo="Cancel"
          effectOne={() => alert("created trip")}
          effectTwo={effectTwo}
          form
        >
          <>
            <p className="block mb-0.5 font-medium">Origin</p>
            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
              <p className="text-neutral-500">Kigali</p>
            </div>
            <label htmlFor="destination" className="block mb-0.5 font-medium">
              Destination <span className="text-red-500 text-base">*</span>
            </label>

            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
              <DropDown onSelect={()=>console.log('object')} options={["seat1", "seat2"]} style="v1" />
            </div>
            <label htmlFor="bus" className="block mb-0.5 font-medium">
              Bus <span className="text-red-500 text-base">*</span>
            </label>
            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
              <DropDown onSelect={()=>console.log('object')} options={["seat1", "seat2"]} style="v1" />
            </div>
            <label htmlFor="bus" className="block mb-0.5 font-medium">
              Departure time <span className="text-red-500 text-base">*</span>
            </label>
            <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white flex items-center justify-between">
              <p>Choose date and time</p>
              <BiCalendarAlt size={14} />
            </div>
          </>
        </Modal>
    )
}

export default CreateTrip
