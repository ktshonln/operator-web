import { IconType } from "react-icons";
import { FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";
import { letterFormatTotal } from "../utils/helpers";

interface Props {
  metric: number;
  Icon: IconType;
  custIcon?:string;
  title: string;
  subtitle?: string;
  action?: string;
  effect?: () => void;
  variation: { type: string; value: number };
  options?: string[]
}
const InsightCard = ({
  metric,
  Icon,
  custIcon,
  title,
  subtitle,
  action,
  effect,
  variation,
  options
}: Props) => {
  return (
      <div className="relative self-stretch  items-end w-full border rounded-xl border-neutral-200 mt-1 p-1 pl-4 pr-4">
        <p onClick={effect} className=" flex justify-self-end text-brand text-xs mr-6 cursor-pointer">
          {action??""}
          {!action&&<br/>}
        </p>
        <div className="flex items-center space-x-2">
            {options?.includes('money') && <p className="font-bold text-xs text-neutral-500">RWF</p>}
        <span className="font-bold text-2xl">{`${options?.includes('money') ? letterFormatTotal(metric) :metric}`}</span>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <div className="bg-brand rounded-full text-white w-fit p-2">
            {custIcon? <img src={custIcon} className="w-3 h-3" alt="RWFIcon" />:<Icon size={12} className="stroke-[.7px]" />}
          </div>
          <p className="font-semibold text-brand2 text-sm">
          <span className="text-xs block font-bold text-brand">{subtitle}</span>
            {title}
          </p>
        </div>
        <div
          className={`flex items-center text-xs ${
            variation.type === "up" ? "text-green-600" : "text-red-500"
          }  font-semibold justify-self-end bottom-0`}
        >
          {variation.type === "up" ? <FiArrowUpRight /> : <FiArrowDownLeft />}
          <p>{variation.value}%</p>
        </div>
      </div>
  );
};

export default InsightCard;
