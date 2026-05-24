import { useFieldArray, useForm } from "react-hook-form";
import { RouteDetails } from "../hooks/useAddRoute";
import { Route } from "../hooks/useRoutes";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormData, schema } from "./DestinationManager";
import useEditRoute from "../hooks/useEditRoute";
import useDeleteRoute from "../hooks/useDeleteRoute";
import { useState } from "react";
import { formatMoney } from "../utils/helpers";
import { BiCheck, BiChevronDown } from "react-icons/bi";
import { AiOutlineClose, AiOutlineDelete, AiTwotoneEdit } from "react-icons/ai";
import IntermediateRouteForm from "./IntermediateRouteForm";

interface Props {
    route: Route;
    companyId: string;
    routesLoading: boolean;
    i: number; // index
}

const RouteForm = ({route: routeProp, companyId, routesLoading, i}: Props) => {
  const routeId = routeProp.routeId ?? routeProp.id ?? '';
  const route = routeProp.route ?? { start: '', end: '', startId: '', endId: '' };
  const price = routeProp.price ?? 0;
  const intermediateStops = routeProp.intermediateStops ?? [];
      const [editRow, setEditRow] = useState<number | null>(null);
      const [editDest, setEditDest] = useState<string>(""); // The current destination to edit(it's id)
      const [deleteDest, setDeleteDest] = useState<string>(""); // The current destination to deleted(it's id)
      const [deleteRow, setDeleteRow] = useState<number | null>(null);
   
      const [mid, setMid] = useState<number | null>(null); // Show intermediate stops
      const [, setDval] = useState<string | null>(null); // Destination value
      const [, setPval] = useState<string | null>(null); // Price value
                const [midDVal, setMidDVal] = useState(''); // Intermediate stop destination value
            const [midPVal, setMidPVal] = useState(0); // Intermediate stop price value
      
    
    const { register,
        control,
                handleSubmit,
                trigger,
                formState: { errors },} = useForm<FormData>(
{ resolver: zodResolver(schema), defaultValues: {
      intermediateStops: intermediateStops,
      price: price
    }, })


 const editRoute = useEditRoute(companyId, editDest);



  const deleteRoute = useDeleteRoute(companyId, deleteDest);
  const onSubmit = (data: RouteDetails) => {
    console.log("Edited!", data);
    editRoute.mutate(data);
    setEditRow(null)
  };

   const { fields, append, remove } = useFieldArray({
    control,
    name: "intermediateStops",
  });
  
  const handleAddStop = ()=>{
    append({ name: midDVal, price: midPVal });
    // Optionally clear inputs
    setMidDVal("");
    setMidPVal(0);
  }
    return (
                 <tr key={routeId} className="text-brand2 align-baseline">
                  <td colSpan={2}>
                    <div className="w-full">
                      <div className="w-full">
                        {/* Destination section */}
                        {routesLoading && <div className="w-full h-10 mb-2 rounded-md animate-pulse bg-neutral-200"/>}
                        <form
                          onSubmit={handleSubmit(onSubmit)}
                          className="relative flex items-center justify-between"
                        >
                          <div className="flex items-center w-full">
                            {deleteRow === i && (
                              <hr className="absolute top-4 w-sm" />
                            )}
                            <div className="min-w-2/3">
                              {editRow === i ? (
                                <div className="text-black dark:text-white">
                                  {i + 1}.{" "}
                                  <input
                                    type="hidden"
                                    defaultValue={route?.start}
                                    {...register("route.start")}
                                  />
                                  <input
                                    {...register("route.end")}
                                    name="route.end"
                                    type="text"
                                    defaultValue={route?.end}
                                    className="border border-neutral-400  rounded-sm pl-0.5  outline-none"
                                  />
                                  {errors.route?.end && (
                                    <p className="text-red-500 text-xs">
                                      {errors.route.end.message}
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
                                  {...register("price", {
                                    valueAsNumber: true,
                                  })}
                                  name="price"
                                  type="number"
                                  defaultValue={price}
                                  className="border border-neutral-400 w-16  rounded-sm text-black dark:text-white outline-none"
                                />
                                {errors.price && (
                                  <p className="text-red-500 text-xs">
                                    {errors.price.message}
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
                                  setEditDest(routeId);
                                  setEditRow(i);
                                }}
                                className={`text-black dark:text-white cursor-pointer ${
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
                              <button type={editRow===i ?"submit": 'button'} onClick={()=>{!editRow && deleteDest && deleteRoute.mutate()}}>
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
                                  <h3 className="font-bold text-black dark:text-white">
                                    Intermediate stops
                                  </h3>
                                  <ol className="space-y-1">
                                    {
                                    /* intermediateStops?.map((stop, index) => (
                                        <IntermediateRouteForm key={stop.stopId+index} index={index} stop={stop} register={register} errors={errors}/>
                                        )) */
                                    fields.map((field, index) => (
                                        <IntermediateRouteForm key={field.id+index} index={index} register={register} remove={remove} trigger={trigger} update={handleSubmit(onSubmit)} errors={errors}/>
  /*         <li key={field.id} className="relative flex">
            <div>
            <input
              {...register(`intermediateStops.${index}.name`)}
              placeholder="Stop name"
            />
            {errors?.intermediateStops&&errors?.intermediateStops[index]?.name && (
                                  <p className="text-red-500 text-xs">
                                    {errors?.intermediateStops[index]?.name.message}
                                  </p>
                                )}
            </div>
            <div>

            <input
              type="number"
              {...register(`intermediateStops.${index}.price`, {
                valueAsNumber: true,
              })}
              placeholder="Price"
            />
            </div>
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </li> */
        ))
                                    }
                                    {
                                        <div  className="flex justify-between">
                                      <div className="pl-4 ">
                                        <input
                                          type="text"
                                          value={midDVal}
                                          onChange={(e)=>setMidDVal(e.target.value)}
                                          className="border border-neutral-400 text-black dark:text-white rounded-sm pl-0.5  outline-none"
                                        />
                                      </div>
<div>
                                    <input
                                      type="number"
                                      value={midPVal}
                                      onChange={(e)=>setMidPVal(Number(e.target.value))}
                                      className="border border-neutral-400 w-16  rounded-sm pl-0.5 text-black dark:text-white outline-none"
                                    />
                                  </div>
                                    <button onClick={handleAddStop} type="button" className="text-brand cursor-pointer active:scale-95 justify-self-end">
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
    )
}

export default RouteForm
