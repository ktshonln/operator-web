import { useEffect, useState } from "react";
import DropDown from "./DropDown";
import Search from "./Search";
import { formatMoney } from "../utils/helpers";
import { BiCheck, BiChevronDown } from "react-icons/bi";
import { AiOutlineClose, AiOutlineDelete, AiTwotoneEdit } from "react-icons/ai";
import useCompany from "../hooks/useCompany";
import { Route, RouteQuery } from "../hooks/useRoutes";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAddRoute, { RouteDetails } from "../hooks/useAddRoute";
import { CgSpinner } from "react-icons/cg";
import useEditRoute from "../hooks/useEditRoute";
import useDeleteRoute from "../hooks/useDeleteRoute";

const schema = z.object({
  route: z.object({
    start: z.string().min(2, { message: "Please enter a valid origin." }),
    end: z.string().min(2, { message: "Please enter a valid destination" }),
  }),
  price: z.number().min(0.01, { message: "Please enter a valid price." }),
  intermediateStops: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, { message: "Please enter a valid intermediate stop." }),
        price: z.number().min(0, { message: "Please enter a valid price." }),
      })
    )
    .optional(),
});
type FormData = z.infer<typeof schema>;

const schemaEdit = z.array(schema);
type FormDataEdit = z.infer<typeof schema>;

const DestinationManager = ({ companyId }: { companyId: string }) => {
  const { data: company } = useCompany(companyId);
  const routes = [
    {
      routeId: "123",
      route: {
        startId: "123",
        start: "kigali",
        endId: "endId",
        end: "Nyamagabe",
      },
      price: 4250,
      intermediateStops: [
        { name: "Muhanga", price: 1000 },
        { name: "Nyanza", price: 1000 },
        { name: "Huye", price: 1000 },
      ],
    },
    {
      routeId: "124",
      route: {
        startId: "123",
        start: "kigali",
        endId: "endId",
        end: "Nyamagabe",
      },
      price: 4250,
      intermediateStops: [
        { name: "Muhanga", price: 1000 },
        { name: "Nyanza", price: 1000 },
        { name: "Huye", price: 1000 },
      ],
    },
    {
      routeId: "125",
      route: {
        startId: "123",
        start: "kigali",
        endId: "endId",
        end: "Nyamagabe",
      },
      price: 4250,
      intermediateStops: [
        { name: "Muhanga", price: 1000 },
        { name: "Nyanza", price: 1000 },
        { name: "Huye", price: 1000 },
      ],
    },
    {
      routeId: "126",
      route: {
        startId: "123",
        start: "kigali",
        endId: "endId",
        end: "Nyamagabe",
      },
      price: 4250,
      intermediateStops: [
        { name: "Muhanga", price: 1000 },
        { name: "Nyanza", price: 1000 },
        { name: "Huye", price: 1000 },
      ],
    },
  ];
  const [routeQuery, setRouteQuery] = useState<RouteQuery>({} as RouteQuery);
  const [editRow, setEditRow] = useState<number | null>(null);
  const [editDest, setEditDest] = useState<string>(""); // The current destination to edit(it's id)
  const [deleteDest, setDeleteDest] = useState<string>(""); // The current destination to deleted(it's id)
  const [deleteRow, setDeleteRow] = useState<number | null>(null);
  const [editMRow, setEditMRow] = useState<number | null>(null);
  const [deleteMRow, setDeleteMRow] = useState<number | null>(null);
  const [mid, setMid] = useState<number | null>(null); // Show intermediate stops
  const [dVal, setDval] = useState<string | null>(null); // Destination value
  const [pVal, setPval] = useState<string | null>(null); // Price value
  const [midDVal, setMidDVal] = useState<string | null>(null); // Intermediate stop destination value
  const [midPVal, setMidPVal] = useState<string | null>(null); // Intermediate stop price value

  const [selectBranch, setSelectBranch] = useState<string>(""); // The currently selected branch

  useEffect(() => {
    setSelectBranch(company?.branches[0] ?? "");
  }, [company]);

  const values = {
    route: {
      start: selectBranch,
      end: "",
    },
    price: 0,
  };

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: errorsAdd },
  } = useForm<FormData>({ resolver: zodResolver(schema), values }); // values help make React Hook Form update reactively with external state, i.e initializing the start branch

  const addRoute = useAddRoute(companyId);

  const onSubmitAdd = (data: RouteDetails) => {
    console.log("Added!", data);
    addRoute.mutate(data);
  };

  // Create a form instance per route
  const forms = routes.map((route) =>
    useForm<FormData>({ resolver: zodResolver(schema) })
  );

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const editRoute = useEditRoute(companyId, editDest);

  const onSubmitEdit = (data: RouteDetails) => {
    console.log("Edited!", data);
    editRoute.mutate(data);
  };

  const deleteRoute = useDeleteRoute(companyId, deleteDest);
  return (
    <div className="mr-10 w-full">
      <h2 className="font-bold mt-5 mb-5 w-fit mx-auto">
        Manage routes {/* Routes is better than destinations */}
      </h2>
      <div className="flex items-center gap-5 justify-between mb-5 text-sm">
        <Search
          label="Search destination..."
          onSearch={(searchText) =>
            setRouteQuery({ ...routeQuery, searchText: searchText })
          }
          alt
        />
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-black">Origin: </h3>
          <div className="ring ring-gray-200 p-1 rounded-xs bg-white">
            {company?.branches ? (
              <DropDown
                options={company?.branches ?? []}
                onSelect={(branch) => {
                  setRouteQuery({ ...routeQuery, branch });
                  setSelectBranch(branch);
                }}
                style="v2"
              />
            ) : (
              <CgSpinner className="animate-spin" />
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        <table className="text-sm w-full ">
          <thead>
            <tr>
              <th className=" text-start pl-5 pb-3">Destination</th>
              <th className=" text-start pb-3">Price(RWF)</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(({ routeId, route, price, intermediateStops }, i) => {
              const {
                register: registerEdit,
                handleSubmit: handleSubmitEdit,
                formState: { errors: errorsEdit },
              } = forms[i];
              return (
                <tr key={routeId} className="text-brand2 align-baseline">
                  <td colSpan={2}>
                    <div className="w-full">
                      <div className="w-full">
                        {/* Destination section */}
                        <form
                          onSubmit={handleSubmitEdit(onSubmitEdit)}
                          className="relative pb-3  flex items-center justify-between"
                        >
                          <div className="flex items-center w-full">
                            {deleteRow === i && (
                              <hr className="absolute top-4 w-sm" />
                            )}
                            <div className="min-w-2/3">
                              {editRow === i ? (
                                <div className="text-black">
                                  {i + 1}.{" "}
                                  <input
                                    type="hidden"
                                    defaultValue={route?.start}
                                    {...registerEdit("route.start")}
                                  />
                                  <input
                                    {...registerEdit("route.end")}
                                    name="route.end"
                                    type="text"
                                    defaultValue={route?.end}
                                    className="border border-neutral-400  rounded-sm pl-0.5  outline-none"
                                  />
                                  {errorsEdit.route?.end && (
                                    <p className="text-red-500 text-xs">
                                      {errorsEdit.route.end.message}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p>{`${i + 1}. ${route?.end}`}</p>
                              )}
                            </div>
                            {editRow === i ? (
                              <div>
                                <input
                                  {...registerEdit("price", {
                                    valueAsNumber: true,
                                  })}
                                  name="price"
                                  type="number"
                                  defaultValue={price}
                                  className="border border-neutral-400 w-16  rounded-sm text-black outline-none"
                                />
                                {errorsEdit.price && (
                                  <p className="text-red-500 text-xs">
                                    {errorsEdit.price.message}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p>{formatMoney(price)}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-end space-x-2 pb-3">
                            {
                              <BiChevronDown
                                size={20}
                                onClick={() => {
                                  setMid(mid !== null && mid === i ? null : i);
                                }}
                                className={`text-black cursor-pointer ${
                                  mid === i && "rotate-180"
                                }`}
                              />
                            }
                            {editRow !== i && deleteRow !== i && (
                              <AiTwotoneEdit
                                size={15}
                                onClick={() => {
                                  setDval(null);
                                  setPval(null);
                                  setEditRow(i);
                                  setEditDest(routeId);
                                }}
                                className="text-brand hover:scale-110 cursor-pointer"
                              />
                            )}
                            {editRow !== i && deleteRow !== i && (
                              <AiOutlineDelete
                                size={15}
                                onClick={() => {
                                    setDeleteRow(i);
                                    setDeleteDest(routeId)
                                }}
                                className="text-[#FF6666] hover:scale-110 cursor-pointer"
                              />
                            )}
                            {(editRow === i || deleteRow === i) && (
                              <button type="submit" onClick={()=>{!editDest && deleteDest && deleteRoute.mutate()}}>
                                <BiCheck
                                  size={20}
                                  className="text-[#32CD32] hover:scale-110 cursor-pointer active:scale-95"
                                />
                              </button>
                            )}
                            {(editRow === i || deleteRow === i) && (
                              <AiOutlineClose
                                onClick={() => {
                                  setEditRow(null);
                                  setDeleteRow(null);
                                  setDval(null);
                                  setPval(null);
                                }}
                                size={15}
                                className="text-[#FF6666] hover:scale-110 cursor-pointer"
                              />
                            )}
                          </div>
                        </form>

                        <div className="flex justify-between">
                          <div className=" w-full">
                            {/* Intermediate stop section */}
                            <div className="relative pb-3">
                              {mid === i && (
                                <div className="border-l border-neutral-500 pl-1 ml-10 mt-1">
                                  <h3 className="font-bold text-black">
                                    Intermediate stops
                                  </h3>
                                  <ol className="space-y-1">
                                    {intermediateStops.map((stop, index) => (
                                      <li className="relative" key={index}>
                                        <form action="" className="flex justify-between">

                                        {deleteMRow === index && (
                                            <hr className="absolute top-2.5 w-sm" />
                                        )}
                                        <div className="w-full">
                                        {editMRow === index ? (
                                          <div className="text-black flex bgbl">
                                            <div className=" min-w-2/3">
                                            {index + 1}.{" "}
                                            <input
                                              onChange={(e) =>
                                                setMidDVal(e.target.value)
                                              }
                                              type="text"
                                              value={
                                                  midDVal || midDVal === ""
                                                  ? midDVal
                                                  : stop.name
                                                }
                                                className="border border-neutral-400  rounded-sm pl-0.5  outline-none "
                                                />
                                            </div>
                                             <input
                                          onChange={(e) =>
                                            setMidPVal(e.target.value)
                                          }
                                          type="number"
                                          value={
                                            midPVal || midPVal === ""
                                              ? midPVal
                                              : stop.price
                                          }
                                          className="border border-neutral-400  rounded-sm pl-0.5 w-16 text-black outline-none"
                                        />
                                          </div>
                                        ) : (
                                            <p className="flex">
                                                <span className="min-w-2/3 ">

                                                {`${index + 1}. ${stop.name}`}
                                                </span>
                                                <span>
                                                    {formatMoney(stop.price)}
                                                </span>
                                            </p>
                                        )}
                                        </div>
                                        <div>

                                        </div>
    <div className="flex items-center space-x-2 ml-7">
                                      {editMRow !== index &&
                                        deleteMRow !== index && (
                                          <AiTwotoneEdit
                                            size={15}
                                            onClick={() => {
                                              setMidDVal(null);
                                              setMidPVal(null);
                                              setEditMRow(index);
                                            }}
                                            className="text-brand hover:scale-110 cursor-pointer"
                                          />
                                        )}
                                      {editMRow !== index &&
                                        deleteMRow !== index && (
                                          <AiOutlineDelete
                                            size={15}
                                            onClick={() => setDeleteMRow(index)}
                                            className="text-[#FF6666] hover:scale-110 cursor-pointer"
                                          />
                                        )}
                                      {(editMRow === index ||
                                        deleteMRow === index) && (
                                        <BiCheck
                                          size={20}
                                          className="text-[#32CD32] hover:scale-110 cursor-pointer"
                                        />
                                      )}
                                      {(editMRow === index ||
                                        deleteMRow === index) && (
                                        <AiOutlineClose
                                          onClick={() => {
                                            setEditMRow(null);
                                            setDeleteMRow(null);
                                            setMidDVal(null);
                                            setMidPVal(null);
                                          }}
                                          size={15}
                                          className="text-[#FF6666] hover:scale-110 cursor-pointer"
                                        />
                                      )}
                                    </div>
                                        </form>
                                      </li>
                                    ))}
                                    {
                                        <div className="flex justify-between">
                                      <div className="pl-4 ">
                                        <input
                                          type="text"
                                          className="border border-neutral-400  rounded-sm pl-0.5  outline-none"
                                        />
                                      </div>
<div>
                                    <input
                                      type="number"
                                      className="border border-neutral-400 w-16  rounded-sm pl-0.5 text-black outline-none"
                                    />
                                  </div>
                                    <button type="button" className="text-brand cursor-pointer active:scale-95 justify-self-end">
                                  Add new
                                </button>
                                        </div>
                                    }
                                  </ol>
                                </div>

                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                /* here */
              );
            })}
            <tr>
              <td className="pl-4" colSpan={2}>
                <form
                  onSubmit={handleSubmitAdd(onSubmitAdd)}
                  className="flex items-start justify-between"
                >
                  <div>
                    <input
                      {...registerAdd("route.end")}
                      type="text"
                      className="border border-neutral-400  rounded-sm pl-0.5  outline-none mb-1"
                    />
                    {errorsAdd.route?.end && (
                      <p className="text-red-500 text-xs">
                        {errorsAdd.route.end.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...registerAdd("price", { valueAsNumber: true })}
                      defaultValue={0}
                      type="number"
                      className="border border-neutral-400 w-16  rounded-sm pl-0.5 text-black outline-none mb-1"
                    />
                    {errorsAdd.price && (
                      <p className="text-red-500 text-xs">
                        {errorsAdd.price.message}
                      </p>
                    )}
                  </div>
                  <button
                    disabled={!selectBranch}
                    type="submit"
                    className="text-brand cursor-pointer active:scale-95"
                  >
                    Add new
                  </button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DestinationManager;

/* const RouteForm = ({routeData}:{routeData: Route})=>{
const {register, handleSubmit} = useForm({

})
} */
