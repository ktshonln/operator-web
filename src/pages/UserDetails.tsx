import { useState } from "react";
import { BiSolidUserCircle } from "react-icons/bi";
import SettingsNav from "../components/SettingsNav";
import WidgetLayout from "../components/layouts/WidgetLayout";
import { useParams } from "react-router-dom";
import useAgent from "../hooks/useAgent";
import useUser from "../hooks/useUser";

function UserDetails() {
  const [access, setAccess] = useState(true); // Account access for the user/agent
  const { userId } = useParams<{ userId: string }>();
  const { user } = useUser();
  const orgId = (user as any)?.org_id ?? "";
  const { data } = useAgent(orgId, userId ?? "");
  console.log(data);
  return (
    <div className="mt-10">
      <SettingsNav />

      <h1 className="font-bold text-lg mb-3">
        Manage users{" "}
        <span className="font-normal text-sm">
          / {data?.firstName + " " + data?.lastName}
        </span>
      </h1>
      <div className="flex  space-x-3">
        <div className=" ml-3 mr-10 mt-5 grow ">
          <div className="flex items-center space-x-2 ml-5">
            <div className="p-2.5 rounded-md bg-neutral-200 text-brand2">
              <BiSolidUserCircle size={41} />
            </div>
            <div className="text-sm">
              <p className="font-bold text-lg">
                {data?.firstName + " " + data?.lastName}
              </p>
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
              <p>Allow access</p>
              <div
                onClick={() => setAccess(!access)}
                className={`bg-brand w-10 h-5 rounded-full flex items-center p-0.5 pb-[2.2px] cursor-pointer ${
                  access ? " justify-end" : "bg-neutral-300"
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full" />
              </div>
            </div>
          </div>
          <h2 className="font-bold  text-sm mt-5 mb-5">Details</h2>
          <div className="text-sm">
            <div className="text-neutral-400 font-semibold flex justify-between">
              <p className="w-40">Email: </p>
              <p className="text-black font-normal">{data?.email}</p>
            </div>
            <div className="text-neutral-400 font-semibold flex justify-between">
              <p className="w-96">Phone Number: </p>
              <p className="text-black font-normal">{data?.phoneNumber}</p>
            </div>
            <div className="text-neutral-400 font-semibold flex justify-between">
              <p className="w-40">Role: </p>
              <p className="text-black font-normal">{data?.role}</p>
            </div>
            <div className="text-neutral-400 font-semibold flex justify-between">
              <p className="w-40">Branch: </p>
              <p className="text-black font-normal">Kigali</p>
            </div>

            <div className="text-neutral-400 font-semibold flex justify-between">
              <p className="w-40">Status: </p>
              <p className="text-black font-normal">{data?.status}</p>
            </div>
          </div>
          <h2 className="font-bold  text-sm mt-5 mb-5">Permissions</h2>
          <div className="text-sm space-y-2">
            <div className="flex space-x-44 items-center">
              <p className="text-neutral-400   w-40">Sell tickets</p>
              <input type="checkbox" className="w-5 h-5" />
            </div>
            <div className="flex space-x-44 items-center">
              <p className="text-neutral-400  flex w-40">Schedule Trips</p>
              <input type="checkbox" className="w-5 h-5" />
            </div>
            <div className="flex space-x-44 items-center">
              <p className="text-neutral-400  flex w-40">Edit destinations</p>
              <input type="checkbox" className="w-5 h-5" />
            </div>
            <div className="flex space-x-44 items-center">
              <p className="text-neutral-400 w-40">Manage other agents</p>

              <input type="checkbox" className="w-5 h-5" />
            </div>
          </div>
        </div>
        <WidgetLayout>
          <div>
            <h2 className="font-bold  text-sm mt-5 mb-5 w-fit mx-auto">
              {`${data?.firstName}'s activity`}
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

export default UserDetails;
