import { useState } from "react";
import { BsTicket } from "react-icons/bs";
import { MdRoute } from "react-icons/md";
import DonutChart from "../components/DonutChart";
import InsightCard from "../components/InsightCard";
import TableOne from "../components/TableOne";
import TableTwo from "../components/TableTwo";
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
import { useAnalyticsOverview, AnalyticsOverviewParams } from "../hooks/useAnalyticsOverview";
import Filter from "../components/Filter";

// Period selector for the analytics overview
const PERIOD_OPTIONS: { label: string; value: AnalyticsOverviewParams["period"] }[] = [
  { label: "Today", value: "today" },
  { label: "This week", value: "this_week" },
  { label: "This month", value: "this_month" },
];

function HomePage() {
  const user = useRequiredUser()
  const userLoad = user ? false : true;
  const { data: company } = useCompany(user?.org_id ?? "");

  const [period, setPeriod] = useState<AnalyticsOverviewParams["period"]>("today");
  const [ticketQuery, setTicketQuery] = useState<TicketQuery>(
    {} as TicketQuery
  );

  // Onboarding welcome — shown when last_login_at is null (first login after activation)
  const isFirstLogin = user && (user as any).last_login_at === null;
  const [showWelcome, setShowWelcome] = useState(false);
  // Only show once per session
  useState(() => {
    if (isFirstLogin) setShowWelcome(true);
  });

  const {
    overview,
    revAnalytics,
    popularRoutes,
    peakTimes,
    isLoading: analyticsLoad,
  } = useAnalyticsOverview({ period, tz: "Africa/Kigali" }, !!user?.org_id);

  const { data: tickets } = useTickets(ticketQuery);

  const [dest, setDest] = useState<number | null>(null);
  const navigate = useNavigate();
  const {
    show2,
    showMenu2,
    hideMenu2,
  } = useMenuStore();

  return (
    <div className="flex space-x-3 dark:text-white">
      {/* Onboarding welcome modal */}
      {showWelcome && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[70]" onClick={() => setShowWelcome(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-[71] p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="font-bold text-2xl text-neutral-900 dark:text-white mb-2">
                Welcome to Katisha, {user?.first_name}!
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                Your organization account is now active. Here's what you can do to get started:
              </p>
              <div className="text-left space-y-3 my-5">
                {[
                  { icon: "👥", title: "Invite your team", desc: "Add dispatchers and drivers under Team → Users", link: "/team/users" },
                  { icon: "🚌", title: "Add your fleet", desc: "Register buses and drivers under Fleets", link: "/fleets/buses" },
                  { icon: "🗺️", title: "Set up routes", desc: "Define your routes and trips", link: "/trips" },
                  { icon: "⚙️", title: "Complete your profile", desc: "Add your organization logo and details", link: "/settings/profile" },
                ].map(({ icon, title, desc, link }) => (
                  <button key={link} onClick={() => { setShowWelcome(false); navigate(link); }}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="font-medium text-sm text-neutral-900 dark:text-white">{title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowWelcome(false)}
                className="w-full bg-brand text-white py-2.5 rounded-lg font-medium hover:brightness-95 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </>
      )}
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

        {/* Period selector */}
        <div className="flex items-center border rounded-xl border-neutral-200 dark:border-neutral-800 font-medium text-xs text-brand2 p-1 mt-2 gap-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`flex-1 text-center p-1 pl-4 pr-4 rounded-lg cursor-pointer transition-colors ${
                period === opt.value ? "bg-brand text-white" : "hover:bg-gray-100 dark:hover:bg-neutral-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
          {/* Branch filter still uses the old Filter only for ticket query */}
          {company?.branches && user?.roles[0] === "admin" && (
            <Filter
              userRole={user?.roles[0] as Role}
              branches={company?.branches}
              onSelectFilter={(filter) => {
                setTicketQuery({
                  ...ticketQuery,
                  startDate: filter.startDate,
                  endDate: filter.endDate,
                  branch: filter.branch,
                });
              }}
            />
          )}
        </div>

        <div className="flex items-baseline justify-between gap-1">
          <InsightCard
            loading={userLoad || analyticsLoad}
            metric={overview?.summary.sold_tickets.value ?? 0}
            Icon={BsTicket}
            title="Sold Tickets"
            action="View"
            effect={() => navigate("/ticketing/history")}
            variation={{
              type: (overview?.summary.sold_tickets.delta_pct ?? 0) >= 0 ? "up" : "down",
              value: Math.abs(overview?.summary.sold_tickets.delta_pct ?? 12),
            }}
          />
          <InsightCard
            loading={userLoad || analyticsLoad}
            metric={overview?.summary.revenue.value ?? 0}
            custIcon="/RWFIcon.svg"
            Icon={BsTicket}
            title="Total Revenue"
            variation={{
              type: (overview?.summary.revenue.delta_pct ?? 0) >= 0 ? "up" : "down",
              value: Math.abs(overview?.summary.revenue.delta_pct ?? 2),
            }}
            options={["money"]}
          />
          <InsightCard
            loading={analyticsLoad}
            metric={overview?.summary.capacity.total_seats ?? 845}
            Icon={BsTicket}
            title="Total Tickets"
            subtitle={`${overview?.summary.capacity.available ?? 500} available`}
            action="- Sell ticket"
            effect={() => navigate("/ticketing")}
            variation={{
              type: (overview?.summary.capacity.delta_pct ?? 0) >= 0 ? "up" : "down",
              value: Math.abs(overview?.summary.capacity.delta_pct ?? 8),
            }}
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
          {peakTimes && <PeakTrafficChart peakTimes={peakTimes} />}
        </div>
      </div>}
    </div>
  );
}

export default HomePage;
