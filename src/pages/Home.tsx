import { useState } from "react";
import { BsTicket } from "react-icons/bs";
import { MdRoute } from "react-icons/md";
import DonutChart from "../components/DonutChart";
import Filter from "../components/Filter";
import InsightCard from "../components/InsightCard";
import TableOne from "../components/TableOne";
import TableTwo from "../components/TableTwo";
import useAnalytics, { AnalyticsQuery } from "../hooks/useAnalytics";
import usePeakTimes from "../hooks/usePeakTimes";
import usePopularRoutes from "../hooks/usePopularRoutes";
import useRevenueAnalytics from "../hooks/useRevenueAnalytics";
import useTickets, { TicketQuery } from "../hooks/useTickets";
import { Role } from "../hooks/useUser";
import { camelCaseToTitle } from "../utils/helpers";
import PeakTrafficChart from "../components/PeakTrafficChart";
import useCompany from "../hooks/useCompany";
import { useNavigate } from "react-router-dom";
import { useMenuStore } from "../stores/menuStore";
import { AiOutlineClose } from "react-icons/ai";
import { LuPanelRightClose, LuPanelRightOpen } from "react-icons/lu";
import { useRequiredUser } from "../hooks/useRequiredUser";

function HomePage() {
  const user = useRequiredUser()
  const userLoad = user ? false : true;
  const { data: company } = useCompany(user?.org_id ?? "");
  console.log("COMPANY", company);
  const [analyticsQuery, setAnalyticsQuery] = useState<AnalyticsQuery>(
    {} as AnalyticsQuery
  );
  const [ticketQuery, setTicketQuery] = useState<TicketQuery>(
    {} as TicketQuery
  );

  const {
    data: analytics,
    isLoading: analyticsLoad,
  } = useAnalytics(user?.org_id ?? "", analyticsQuery);
  const { data: revAns } = useRevenueAnalytics(
    user?.org_id ?? "",
    analyticsQuery
  );
  const revAnalytics = Array.isArray(revAns) ? revAns : [];

  const { data: popularRoutes } = usePopularRoutes(
    user?.org_id ?? "",
    analyticsQuery
  );
  const { data: peakTimes } = usePeakTimes(user?.org_id ?? "", analyticsQuery);
  const { data: tickets } = useTickets(ticketQuery);

  const [dest, setDest] = useState<number | null>(null);
  const navigate = useNavigate();
  const {
    show2,
    showMenu2,
    hideMenu2,
  } = useMenuStore();
  console.log("The Query", analyticsQuery);
  return (
    <div className="flex space-x-3 dark:text-white">
      {/* Dashboard */}
      <div className=" ml-3 mt-5 mb-5 grow">
        {
          <LuPanelRightOpen
            size={20}
            onClick={showMenu2}
            title="Open right sidebar"
            className="absolute top-3 right-2 hidden sm:block cursor-pointer"
          />
        }
        <p className="font-bold text-2xl">
          Good morning,{" "}
          <span className="text-brand">
            {camelCaseToTitle(user?.first_name ?? "")}!
          </span>
        </p>
        <p className="text-sm text-brand2">
          Checkout real-time analytics and insights
        </p>
        <Filter
          userRole={user?.roles[0] as Role}
          branches={company?.branches}
          onSelectFilter={(filter) => {
            setAnalyticsQuery({
              ...analyticsQuery,
              startDate: filter.startDate,
              endDate: filter.endDate,
              branch: filter.branch?.name,
            });
            setTicketQuery({
              ...ticketQuery,
              startDate: filter.startDate,
              endDate: filter.endDate,
              branch: filter.branch,
            });
          }}
        />
        <div className="flex items-baseline justify-between gap-1">
          <InsightCard
            loading={userLoad || analyticsLoad}
            metric={analytics?.totalTicketsSold ?? 0}
            Icon={BsTicket}
            title="Sold Tickets"
            action="View"
            effect={() => navigate("/ticketing/history")}
            variation={{ type: "up", value: 12 }}
          />
          <InsightCard
            loading={userLoad || analyticsLoad}
            metric={analytics?.totalRevenue?.amount ?? 0}
            custIcon="/RWFIcon.svg"
            Icon={BsTicket}
            title="Total Revenue"
            variation={{ type: "down", value: 2 }}
            options={["money"]}
          />
          <InsightCard
            loading={analyticsLoad}
            metric={845}
            Icon={BsTicket}
            title="Total Tickets"
            subtitle="500 available"
            action="- Sell ticket"
            effect={() => navigate("/ticketing")}
            variation={{ type: "up", value: 8 }}
          />
        </div>
        <h2 className="font-semibold text-brand2 text-sm mt-5 mb-5">
          Revenue Breakdown Per Route
        </h2>
        <div className="border-1 border-neutral-200 dark:border-neutral-800 rounded-xl flex max-w-2xl mx-auto  justify-between p-3">
          <DonutChart values={revAnalytics ?? []} currency="RWF" />
          <TableOne data={revAnalytics ?? []} />
        </div>
        <h2 className="font-semibold text-brand2 text-sm mt-5 mb-5">
          Pending and Completed transactions
        </h2>
        <div className="border-1 border-neutral-200 dark:border-neutral-800 rounded-xl flex justify-between p-3">
          <TableTwo tableData={tickets?.tickets ?? []} />
        </div>
      </div>
      {/* Widgets */}
      {show2 && <div
        className={`justify-self-end ${
          show2 ? "w-0" : "hidden sm:block"
        }  w-sm`}
      >
        <div className=" justify-self-end fixed right-0 top-0  min-w-sm w-full h-full mb-5 overflow-y-auto max-w-sm  p-3 shadow-lg rounded-r-md shadow-black/15 dark:shadow-white/15 bg-white dark:bg-black dark:border-l xl:border-none border-l-neutral-800">
          {show2 && (
            <AiOutlineClose
              onClick={hideMenu2}
              title="Close right sidebar"
              className="absolute right-2 sm:hidden cursor-pointer"
            />
          )}
          {
            <LuPanelRightClose
              size={20}
              onClick={hideMenu2}
              title="Close right sidebar"
              className="absolute right-2 hidden sm:block cursor-pointer"
            />
          }
          {/* Top destinations */}
          <h2 className="font-semibold text-brand2 text-sm mt-5 mb-5">
            Top destinations
          </h2>
          <div className="border-1 border-neutral-200 dark:border-neutral-800 rounded-xl p-3 space-y-2 h-fit">
            {(popularRoutes ?? [])?.slice(0, 5).map(({ routeName, rank }, i) => (
              <div
                key={i}
                onMouseEnter={() => setDest(i)}
                onMouseLeave={() => setDest(null)}
                className="flex items-center h-10 space-x-4 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer rounded-lg w-full text-xs "
              >
                {dest === i ? (
                  <p className="font-bold text-brand text-sm">{rank}</p>
                ) : (
                  <MdRoute className="text-brand size-4" />
                )}
                <p className="text-brand2">{routeName}</p>
              </div>
            ))}
          </div>
          <h2 className="font-semibold text-brand2 text-sm mt-5 mb-5">
            Peak Times
          </h2>
          {peakTimes && <PeakTrafficChart peakTimes={peakTimes ?? []} />}
        </div>
      </div>}
      {/* {sellTicket && <SellTicket  effectTwo={() => setSellTicket(false)} />} */}
    </div>
  );
}

export default HomePage;
