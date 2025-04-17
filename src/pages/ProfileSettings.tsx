import { useState } from "react";
import { BiSolidBusiness, BiSolidUserCircle } from "react-icons/bi";
import { FaMapLocationDot } from "react-icons/fa6";
import DropDown from "../components/DropDown";
import SettingsNav from "../components/SettingsNav";
import WidgetLayout from "../layouts/WidgetLayout";


function ProfileSettings() {
  const [active, setActive] = useState(true); // Make the branch active/not
  return (
    <div className="mt-10">
      <SettingsNav />

      <div className="flex  space-x-3">


        <div>

            <div>
                  <h1 className="font-bold text-lg mb-3">
            Admin Profile
                  </h1>
                <div className=" ml-3 mr-10 mt-5 grow ">
                  <div className="flex items-center space-x-2 ml-5">
                    <div className="p-2.5 rounded-md bg-neutral-200 text-brand2">
                      <BiSolidUserCircle size={41} />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-lg">Gasana Innocent</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium flex items-center mt-10 space-x-3">
                    <button
                      type="submit"
                      className="bg-brand p-1.5 w-20 text-white  rounded-sm cursor-pointer"
                    >
                      Edit
                    </button>
                    <button className="bg-[#FF6666] text-white p-1.5 w-20 rounded-sm cursor-pointer">
                      Delete
                    </button>
            
                  </div>
                  <h2 className="font-bold  text-sm mt-5 mb-5">Details</h2>
                  <div className="text-sm space-y-2">
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-40">Email: </p>
                      <p className="text-black font-normal">gainno@gmail.com</p>
                    </div>
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-96">Phone Number: </p>
                      <p className="text-black font-normal">073123456</p>
                    </div>
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-40">Role: </p>
                      <p className="text-black font-normal">Agent</p>
                    </div>
                  </div>
            
                </div>
        </div>
            <div className="mt-5">
                  <h1 className="font-bold text-lg mb-3">
            Company Profile
                  </h1>
                <div className=" ml-3 mr-10 mt-5 grow ">
                  <div className="flex items-center space-x-2 ml-5">
                    <div className="p-2.5 rounded-md bg-neutral-200 text-brand2">
                      <BiSolidBusiness size={41} />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-lg">RITCO</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium flex items-center mt-10 space-x-3">
                    <button
                      type="submit"
                      className="bg-brand p-1.5 w-20 text-white  rounded-sm cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <h2 className="font-bold  text-sm mt-5 mb-5">Details</h2>
                  <div className="text-sm space-y-2">
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-40">Registration number: </p>
                      <p className="text-black font-normal">1209232894</p>
                    </div>
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-96">Address: </p>
                      <p className="text-black font-normal">KN234 Kigali</p>
                    </div>
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-40">Contact Info: </p>
                      <p className="text-black font-normal">0788888223</p>
                    </div>
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-40">Branches: </p>
                      <p className="text-black font-normal">5</p>
                    </div>
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-40">About: </p>
                      <p className="text-black font-normal">RITCO - 
                      Link People With Places</p>
                    </div>
                  </div>
            
                </div>
        </div>
            <div className="mt-5 ">
                <div className="mb-3 flex items-center space-x-5">

                  <h1 className="font-bold text-lg ">
            Branch Profile
                  </h1>
                  <div className="ring ring-gray-200 p-0.5 text-sm rounded-xs bg-white flex justify-between">

                  <DropDown options={['Kigali', 'Huye', 'Musanze']} style="v2"/>
                  </div>
                  <p className="text-sm text-brand">+ Add new</p>
                </div>
                <div className=" ml-3 mr-10 mt-5 grow ">
                  <div className="flex items-center space-x-2 ml-5">
                    <div className="p-2.5 rounded-md bg-neutral-200 text-brand2">
                      <FaMapLocationDot size={41} />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-lg">Kigali</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium flex items-center mt-10 space-x-3">
                    <button
                      type="submit"
                      className="bg-brand p-1.5 w-20 text-white  rounded-sm cursor-pointer"
                    >
                      Edit
                    </button>
                    <button className="bg-[#FF6666] text-white p-1.5 w-20 rounded-sm cursor-pointer">
              Delete
            </button>
            <div className="flex items-center space-x-2 ">
              <p>Active</p>
              <div
                onClick={() => setActive(!active)}
                className={`bg-brand w-10 h-5 rounded-full flex items-center p-0.5 pb-[2.2px] cursor-pointer ${
                  active ? " justify-end" : "bg-neutral-300"
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full" />
              </div>
            </div>
                  </div>
                  <h2 className="font-bold  text-sm mt-5 mb-5">Details</h2>
                  <div className="text-sm space-y-2">
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-40">Address: </p>
                      <p className="text-black font-normal">KN234 Kigali</p>
                    </div>
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-96">Contact info: </p>
                      <p className="text-black font-normal">073123456</p>
                    </div>
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-40">Agents: </p>
                      <p className="text-black font-normal">5</p>
                    </div>
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-40">Agent Manager: </p>
                      <p className="text-black font-normal">Nyiraneza Jacky</p>
                    </div>
                    <div className="text-neutral-400 font-semibold flex justify-between">
                      <p className="w-40">Status: </p>
                      <p className="text-black font-normal">Active</p>
                    </div>
                  </div>
            
                </div>
        </div>


        </div>
        <WidgetLayout>
          <div>
            <h2 className="font-bold  text-sm mt-5 mb-5 w-fit mx-auto">
              Admin's activity
            </h2>
            <div className="text-sm">
            <div className="text-neutral-400 font-semibold flex justify-between">
              <p className="w-40">Added: </p>
              <p className="text-black font-normal">24/2/2025</p>
            </div>
            <div className="text-neutral-400 font-semibold flex justify-between">
              <p className="w-40">Activated: </p>
              <p className="text-black font-normal">24/2/2025</p>
            </div>
            <div className="text-neutral-400 font-semibold flex justify-between">
              <p className="w-40">All time sold tickets: </p>
              <p className="text-black font-normal">4021</p>
            </div>
            </div>
          </div>
        </WidgetLayout>
      </div>
    </div>
  );
}

export default ProfileSettings;
