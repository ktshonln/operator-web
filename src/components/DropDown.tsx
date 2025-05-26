import { JSX, useEffect, useState } from "react";
import { BiChevronDown } from "react-icons/bi";

type Option = {
  label: string;
  value: string;
};
type BaseProps = {
  options: string[];
  label?: (choice:string)=>string // If the label should be different from the value
  style?: "v1" | "v2";
  value?: string | string[]; // This enables the option of choosing multiple values
  multiValue?: number;
};

type SingleSelectProps = BaseProps & {
  multiValue?: undefined;
  onSelect: (choice: string) => void;
};

type MultiSelectProps = BaseProps & {
  multiValue: number;
  onSelect: (choice: string | string[]) => void;
};
// type Props = SingleSelectProps | MultiSelectProps
function DropDown(props: SingleSelectProps): JSX.Element;
function DropDown(props: MultiSelectProps): JSX.Element;
function DropDown(props: SingleSelectProps | MultiSelectProps): JSX.Element {
  const { options,label, style, onSelect, value, multiValue } = props;
  const [optionChoice, setOptionChoice] = useState<string | string[]>(
    value ? value : options[0]
  );
  const [showChoice, setShowChoice] = useState(false);
  const mCondition =
    multiValue !== undefined && multiValue !== null && multiValue >= 2; // The condition that justifies the use of multiValue

  useEffect(() => {
    // Sync ticket quantity to seats
    if (mCondition) {
      setOptionChoice(options.slice(0, multiValue));
      onSelect(options.slice(0, multiValue));
    }
  }, [multiValue]);
  return (
    <div className="relative dark:text-white ">
      <div
        onClick={() => setShowChoice(!showChoice)}
        className={`flex items-center cursor-pointer ${
          style === "v1" || style === "v2"
            ? "space-x-10  w-full justify-between"
            : ""
        }`}
      >
        <p
          className={`${
            style && ["v1", "v2"].includes(style)
              ? "text-black dark:text-white"
              : "text-brand"
          }`}
        >
          {Array.isArray(optionChoice)
            ? optionChoice.map((choice, id) => (
                <span
                  key={id}
                  className="after:content-[','] last-of-type:after:content-none"
                >
                  {" "}
                  {choice}
                </span>
              ))
            : (label ?label(optionChoice):optionChoice)}
        </p>
        <div className="flex space-x-2 items-center">
          {multiValue !== undefined &&
            multiValue !== null &&
            multiValue >= 2 && (
              <span
                onClick={() =>
                  setOptionChoice(
                    multiValue >= 2 ? [] : value ? value : options[0]
                  )
                }
                className="text-xs text-red-500 hover:text-red-800"
              >
                Clear
              </span>
            )}
          <BiChevronDown size={15} />
        </div>
      </div>

      {showChoice && (
        <div
          className={`absolute top-5 right-0 border-1 bg-white dark:bg-black  border-neutral-200 dark:border-neutral-800 shadow-md rounded-md p-1bg-white z-10 ${
            style === "v1" && "w-full mt-1"
          }`}
        >
          {options
            .filter((val) => {
              const selected = Array.isArray(optionChoice)? optionChoice: [optionChoice]
              return !selected.includes(val)})
            .map((option) => (
              <p
                key={option}
                onClick={() => {
                  console.log("OPusiyo", option);
                  setOptionChoice((prev) => {
                    const newValue =
                      multiValue && prev && multiValue > prev.length
                        ? [...prev, option]
                        : multiValue
                        ? [option]
                        : option;
                    multiValue && onSelect(newValue);
                    return newValue;
                  });
                  !multiValue && onSelect(option);
                  setShowChoice(false);
                }}
                className="hover:bg-brand hover:text-white p-1 rounded-md cursor-pointer text-nowrap"
              >
                {label?label(option):option}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}

export default DropDown;
