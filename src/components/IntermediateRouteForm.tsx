import { useState } from "react";
import { AiOutlineClose, AiOutlineDelete, AiTwotoneEdit } from "react-icons/ai";
import { BiCheck } from "react-icons/bi";
import { FieldErrors, UseFormRegister, UseFormTrigger } from "react-hook-form";
import { FormData } from "./DestinationManager";

interface Props {
    // stop: IntermediateStop
    index: number
    register: UseFormRegister<FormData>
    errors: FieldErrors<FormData>
    remove: (index?: number | number[]) => void
    trigger: UseFormTrigger<FormData>
    update: (e?: React.BaseSyntheticEvent) => Promise<void>;
}
const IntermediateRouteForm = ({index,register, errors, remove, trigger,update}: Props) => {
       const [editMRow, setEditMRow] = useState<number | null>(null);
          const [deleteMRow, setDeleteMRow] = useState<number | null>(null);
          const [, setMidDVal] = useState<string | null>(null); // Intermediate stop destination value
      const [, setMidPVal] = useState<string | null>(null); // Intermediate stop price value

      const handleConfirm = (i: number, e:  React.MouseEvent<SVGElement, MouseEvent>)=>{
        if(editMRow===i){
            trigger(`intermediateStops.${i}.name`)
            trigger(`intermediateStops.${i}.price`)
            update(e)
            console.log('Bro am clickiing')
        } else remove(i)
        setEditMRow(null)
    }
    return (
         <li className="relative" >
                                        <form  className="flex justify-between">

                                        {deleteMRow === index && (
                                            <hr className="absolute top-2.5 w-sm" />
                                        )}
                                        <div className="w-full">
                                        {(
                                          <div className={` flex ${editMRow === index && 'text-black dark:text-white'}`}>
                                            <div>
                                            <div className=" min-w-2/3">
                                            {index + 1}.{" "}

                                            <input
                                            {...register(`intermediateStops.${index}.name`)}
                                            type="text"
                                           disabled={editMRow !== index}
                                            className={`  rounded-sm pl-0.5 outline-none white ${editMRow === index && 'border border-neutral-400'}`}
                                            />
                                            </div>
                                            {errors?.intermediateStops&&errors?.intermediateStops[index]?.name && (
                                  <p className="text-red-500 text-xs">
                                    {errors?.intermediateStops[index]?.name.message}
                                  </p>
                                )}
                                            </div>
                                            <div>

                                             <input
                                        {...register(`intermediateStops.${index}.price`, {
                                            valueAsNumber: true,
                                        })}
                                        type="number"
                                       disabled={editMRow !== index}
                                        className={`rounded-sm pl-0.5 w-16 outline-none ${editMRow === index && 'border border-neutral-400'}`}
                                        />
                                        {errors?.intermediateStops&&errors?.intermediateStops[index]?.price && (
                                  <p className="text-red-500 text-xs">
                                    {errors?.intermediateStops[index]?.price.message}
                                  </p>
                                )}
                                        </div>
                                          </div>
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
                                        onClick={(e)=>handleConfirm(index, e)}
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
    )
}

export default IntermediateRouteForm










/* 
import { useState } from "react";
import { IntermediateStop, Route } from "../hooks/useRoutes";
import { formatMoney } from "../utils/helpers";
import { AiOutlineClose, AiOutlineDelete, AiTwotoneEdit } from "react-icons/ai";
import { BiCheck } from "react-icons/bi";
import { FieldErrors, UseFormRegister, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FormData } from "./DestinationManager";

interface Props {
    stop: IntermediateStop
    index: number
    register: UseFormRegister<FormData>
    errors: FieldErrors<FormData>
    remove: (index?: number | number[]) => void
}
const IntermediateRouteForm = ({index, stop, register, errors, remove}: Props) => {
       const [editMRow, setEditMRow] = useState<number | null>(null);
          const [deleteMRow, setDeleteMRow] = useState<number | null>(null);
          const [midDVal, setMidDVal] = useState<string | null>(null); // Intermediate stop destination value
      const [midPVal, setMidPVal] = useState<string | null>(null); // Intermediate stop price value
    return (
         <li className="relative" >
                                        <form action="" className="flex justify-between">

                                        {deleteMRow === index && (
                                            <hr className="absolute top-2.5 w-sm" />
                                        )}
                                        <div className="w-full">
                                        {editMRow === index ? (
                                          <div className="text-black flex bgbl">
                                            <div>
                                            <div className=" min-w-2/3">
                                            {index + 1}.{" "}

                                            <input
                                           
                                            {...register(`intermediateStops.${index}.name`)}
                                            type="text"
                                            value={
                                                midDVal || midDVal === ""
                                                ? midDVal
                                                : stop.name
                                            }
                                            className="border border-neutral-400  rounded-sm pl-0.5  outline-none "
                                            />
                                            </div>
                                            {errors?.intermediateStops&&errors?.intermediateStops[index]?.name && (
                                  <p className="text-red-500 text-xs">
                                    {errors?.intermediateStops[index]?.name.message}
                                  </p>
                                )}
                                            </div>
                                            <div>

                                             <input
                                       
                                        {...register(`intermediateStops.${index}.price`, {
                                            valueAsNumber: true,
                                        })}
                                        type="number"
                                        value={
                                            midPVal || midPVal === ""
                                            ? midPVal
                                            : stop.price
                                        }
                                        className="border border-neutral-400  rounded-sm pl-0.5 w-16 text-black outline-none"
                                        />
                                        {errors?.intermediateStops&&errors?.intermediateStops[index]?.price && (
                                  <p className="text-red-500 text-xs">
                                    {errors?.intermediateStops[index]?.price.message}
                                  </p>
                                )}
                                        </div>
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
                                        onClick={()=>{!editMRow && remove(index)}}
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
    )
}

export default IntermediateRouteForm

*/
