import React, { useEffect, useState } from "react";
import DropDown from "./DropDown";
import Search from "./Search";
import useCompany from "../hooks/useCompany";
import useRoutes, { RouteQuery } from "../hooks/useRoutes";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAddRoute, { RouteDetails } from "../hooks/useAddRoute";
import { CgSpinner } from "react-icons/cg";
import RouteForm from "./RouteForm";

export const schema = z.object({
  route: z.object({
    start: z.string().min(2, { message: "Please enter a valid origin." }),
    end: z.string().min(2, { message: "Please enter a valid destination" }),
  }),
  price: z.number().min(0.01, { message: "Please enter a valid price." }),
  intermediateStops: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Please enter a valid stop name." }),
        price: z.number().min(0.01, { message: "Please enter a valid price." }),
      }),
    )
    .optional(),
});
export type FormData = z.infer<typeof schema>;

const DestinationManager = ({ companyId }: { companyId: string }) => {
  const { data: company } = useCompany(companyId);
  const [routeQuery, setRouteQuery] = useState<RouteQuery>({} as RouteQuery);
  const { data: routes, isLoading: routesLoading } = useRoutes(
    company?.id ?? "",
    routeQuery,
  );
  const [selectBranch, setSelectBranch] = useState<string>(""); // The currently selected branch

  useEffect(() => {
    setSelectBranch(company?.branches?.[0] ?? "");
  }, [company]);

  const values = {
    route: {
      start: selectBranch,
      end: "",
    },
    price: 0,
  };

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), values }); // values help make React Hook Form update reactively with external state, i.e initializing the start branch

  const addRoute = useAddRoute(companyId);

  const onSubmit = (data: RouteDetails) => {
    console.log("Added!", data);
    addRoute.mutate(data);
    resetField("route.end");
    resetField("price");
  };
  // if (!routes?.pages) return <p>Loading..</p>;

  /* const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
  } = useForm<FormData>({ resolver: zodResolver(schema) }); */

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
          <div className="ring ring-gray-200 dark:ring-neutral-800 p-1 rounded-xs bg-white dark:bg-black">
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
            {routes?.pages?.map((page, index) => (
              <React.Fragment key={index}>
                {page.map((route, i) => (
                  <RouteForm
                    key={route.routeId}
                    route={route}
                    companyId={companyId}
                    routesLoading={routesLoading}
                    i={i}
                  />
                ))}
              </React.Fragment>
            ))}
            <tr>
              <td className="pl-4" colSpan={2}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex items-start justify-between"
                >
                  <div>
                    <input
                      {...register("route.end")}
                      type="text"
                      className="border border-neutral-400  rounded-sm pl-0.5  outline-none mb-1"
                    />
                    {errors.route?.end && (
                      <p className="text-red-500 text-xs">
                        {errors.route.end.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register("price", { valueAsNumber: true })}
                      defaultValue={0}
                      type="number"
                      className="border border-neutral-400 w-16  rounded-sm pl-0.5 text-black outline-none mb-1"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-xs">
                        {errors.price.message}
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
