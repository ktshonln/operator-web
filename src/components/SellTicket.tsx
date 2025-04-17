import DropDown from "./DropDown"
import Modal from "./Modal"

const SellTicket = ({effectTwo}:{effectTwo:()=>void}) => {
    return (
        <Modal title="Sell ticket" actionOne="Sell" actionTwo="Cancel" effectOne={()=>alert('created')} effectTwo={effectTwo} form >
         <>
         <label
                  htmlFor="name"
                  className="block mb-0.5 font-medium"
                >
                  Name <span className="text-red-500 text-base">*</span>
                </label>
                <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="outline-none w-full"
                  />
                </div>
                <label
                  htmlFor="phone"
                  className="block mb-0.5 font-medium"
                >
                  Phone Number <span className="text-red-500 text-base">*</span>
                </label>
                <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    className="outline-none w-full"
                  />
                </div>
                <label
                  htmlFor="seat"
                  className="block mb-0.5 font-medium"
                >
                  Seat
                </label>
                <div className="ring ring-gray-200 mb-5 p-1 rounded-xs bg-white">
                    <DropDown options={['seat1', 'seat2']} style="v1"/>
              
                </div>
         </>
        </Modal>
    )
}

export default SellTicket
