import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingsNav from "../components/SettingsNav";
import useAgents from "../hooks/useAgents";
import { camelCaseToTitle } from "../utils/helpers";
import { AgentQuery } from "./ProfileSettings";
import ThemeToggle from "../components/ThemeToggle";
import AddAgent from "../components/AddAgent";
import useUser from "../hooks/useUser";
import Search from "../components/Search";

type Theme = "system" | "light" | "dark";

function Settings() {
  const { user } = useUser();
  const companyId = user?.companyId;
  const userId = user?.id??''
  const tableHeaders = [
    "userId",
    "name",
    "email",
    "phoneNumber",
    "role",
    "status",
  ];
  const navigate = useNavigate();
  const [agentQuery, setAgentQuery] = useState<AgentQuery>({} as AgentQuery);
  const { data: agents, isLoading } = useAgents("comp_001", agentQuery);
  return (
    <div className="mt-10 mb-5 ml-5">
      <SettingsNav />

      <h1 className="font-bold text-lg mb-3">Manage users</h1>
      <div className="flex  space-x-3">
        <div className=" ml-3 mt-5 grow w-80">
         <AddAgent companyId={companyId} userId={userId}/>
          <div className="mt-5">
            <h1 className="font-bold text-lg mb-3 dark:text-white">Theme</h1>
           <ThemeToggle/>
          </div>
        </div>
        <div className="relative  min-w-1/5 max-w-4xl justify-self-end w-full flex">
          <div className="min-w-0  max-w-[870px] overflow-y-scroll overflow-x-hidden  h-screen fixed top-0 right-0 self-stretch flex flex-col p-3 shadow-lg rounded-r-md shadow-black/15 dark:shadow-white/15">
            {/* we could make it collapsible */}
            <div className="mr-10 w-full self-stretch">
              <h2 className="font-bold mt-5 mb-5 w-fit text-sm mx-auto dark:text-white">
                Current users
              </h2>
              
               <Search
                        label="Search users..."
                        onSearch={(searchText) =>
                          setAgentQuery({ ...agentQuery, searchText: searchText })
                        }
                        alt
                      />
              <div className=" mt-7 ">
                <table className="text-sm gap-x-2 w-full">
                  <tbody>
                    <tr className="gap-2">
                      <th className="bg-gray-100 dark:bg-neutral-900 dark:text-white text-start p-1 pb-4 pr-3 pl-3">
                        #
                      </th>
                      {tableHeaders
                        .filter((h) => h !== "userId")
                        .map(
                          (
                            header,
                            i // if some unnecessary headers are present, we can filter them out, e.g: with [includes]
                          ) => (
                            <th
                              key={i}
                              className="bg-gray-100 dark:bg-neutral-900 dark:text-white text-xs w text-start p-1 pb-4 pr-3 pl-3"
                            >
                              {camelCaseToTitle(header).toLocaleUpperCase()}
                            </th>
                          )
                        )}
                    </tr>
                    {isLoading && <p>Loading...</p>}
                   {
                    agents?.pages.map((page, index)=><React.Fragment key={index}>
                       {page?.map(
                      (
                        {
                          userId,
                          firstName,
                          lastName,
                          email,
                          phoneNumber,
                          role,
                          status,
                        },
                        i
                      ) => (
                        <tr
                          key={i}
                          onClick={() => {
                            navigate(`/settings/user/${userId}`);
                          }}
                          className={`odd:bg-gray-100 dark:odd:bg-neutral-900 text-neutral-600 hover:bg-gray-200 dark:hover:bg-neutral-800 cursor-pointer`}
                        >
                          <td className="p-3">{i + 1}</td>
                          <td className="p-3">{firstName + " " + lastName}</td>
                          <td className="p-3">{email}</td>
                          <td className="p-3">{phoneNumber}</td>
                          <td className="p-3">{camelCaseToTitle(role)}</td>
                          <td className="p-3">{camelCaseToTitle(status)}</td>
                        </tr>
                      )
                    )}
                    </React.Fragment>)
                   }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
