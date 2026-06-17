import { useState, useMemo } from "react";
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
import { LuPanelRightOpen } from "react-icons/lu";
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
  const user = useRequiredUser();
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
    popularRoutes: apiPopularRoutes,
    peakTimes,
    isLoading: analyticsLoad,
  } = useAnalyticsOverview({ period, tz: "Africa/Kigali" }, !!user?.org_id);

  const { data: tickets } = useTickets(ticketQuery);

  // Fallback top destinations calculated from tickets if the API returns empty/undefined
  const popularRoutes = useMemo(() => {
    if (apiPopularRoutes && apiPopularRoutes.length > 0) {
      return apiPopularRoutes;
    }
    const ticketsList = (tickets?.tickets ?? []) as any[];
    const counts: Record<string, number> = {};
    ticketsList.forEach((ticket) => {
      let routeName = "";
      if (ticket.boarding_stop?.name && ticket.alighting_stop?.name) {
        routeName = `${ticket.boarding_stop.name} → ${ticket.alighting_stop.name}`;
      } else if (ticket.origin && ticket.destination) {
        routeName = `${ticket.origin} → ${ticket.destination}`;
      }
      if (routeName) {
        counts[routeName] = (counts[routeName] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([routeName], index) => ({
        routeName,
        rank: index + 1,
      }));
  }, [apiPopularRoutes, tickets]);

  const [dest, setDest] = useState<number | null>(null);
  const navigate = useNavigate();
  const {
    show2,
    showMenu2,
    hideMenu2,
  } = useMenuStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex space-x-3 dark:text-white px-6 py-6 min-h-screen">
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
      <div className="w-full min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Welcome back,</p>
            <h1 className="font-bold text-2xl flex items-center gap-1.5">
              {getGreeting()},{" "}
              <span className="text-brand">
                {camelCaseToTitle(user?.first_name ?? "")}!
              </span>
            </h1>
          </div>
          <LuPanelRightOpen
            size={20}
            onClick={showMenu2}
            title="Open right sidebar"
            className="hidden sm:block cursor-pointer text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
          />
        </div>

        {/* Period selector & branch filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center border border-gray-200 dark:border-neutral-800 rounded-xl p-1 bg-white dark:bg-neutral-900 font-medium text-xs text-brand2 gap-1 flex-wrap w-full sm:w-auto">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-4 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  period === opt.value
                    ? "bg-brand text-white"
                    : "text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {company?.branches && user?.roles[0] === "admin" && (
            <div className="w-full sm:w-auto">
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
            </div>
          )}
        </div>

        {/* Insight Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <InsightCard
            loading={userLoad || analyticsLoad}
            metric={overview?.summary.sold_tickets.value ?? 0}
            Icon={BsTicket}
            title="Sold Tickets"
            action="View"
            effect={() => navigate("/ticketing/history")}
            variation={{
              type: (overview?.summary.sold_tickets.delta_pct ?? 0) >= 0 ? "up" : "down",
              value: Math.abs(overview?.summary.sold_tickets.delta_pct ?? 0),
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
              value: Math.abs(overview?.summary.revenue.delta_pct ?? 0),
            }}
            options={["money"]}
          />
          <InsightCard
            loading={analyticsLoad}
            metric={overview?.summary.capacity.total_seats ?? 0}
            Icon={BsTicket}
            title="Total Tickets"
            subtitle={`${overview?.summary.capacity.available ?? 0} available`}
            action="- Sell ticket"
            effect={() => navigate("/trips")}
            variation={{
              type: (overview?.summary.capacity.delta_pct ?? 0) >= 0 ? "up" : "down",
              value: Math.abs(overview?.summary.capacity.delta_pct ?? 0),
            }}
          />
        </div>

        {/* Main layout charts and tables */}
        <div className="bg-white dark:bg-neutral-950/90 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-sm text-neutral-900 dark:text-white mb-4">
            Revenue Breakdown Per Route
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-1/2 flex justify-center">
              <DonutChart values={revAnalytics ?? []} currency="RWF" />
            </div>
            <div className="w-full md:w-1/2">
              <TableOne data={revAnalytics ?? []} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-950/90 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          <h2 className="font-bold text-sm text-neutral-900 dark:text-white mb-4">
            Pending and Completed Transactions
          </h2>
          <TableTwo tableData={tickets?.tickets ?? []} />
        </div>
      </div>

      {/* Widgets Sidebar */}
      {show2 && (
        <div className="print-hide w-80 shrink-0">
          <div className="fixed right-0 top-0 w-80 h-full overflow-y-auto p-6 shadow-2xl bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 z-50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Quick Insights</h2>
              <button onClick={hideMenu2} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <AiOutlineClose size={18} className="text-neutral-500" />
              </button>
            </div>

            {/* Top destinations */}
            <div className="bg-white dark:bg-neutral-950/60 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-6">
              <h3 className="font-bold text-xs text-neutral-400 uppercase tracking-wider mb-4">
                Top Destinations
              </h3>
              <div className="space-y-2">
                {popularRoutes.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic text-center py-4">No data available</p>
                ) : (
                  popularRoutes.slice(0, 5).map(({ routeName, rank }, i) => (
                    <div
                      key={i}
                      onMouseEnter={() => setDest(i)}
                      onMouseLeave={() => setDest(null)}
                      className="flex items-center h-10 space-x-3 px-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 cursor-pointer rounded-lg w-full text-xs transition-colors"
                    >
                      {dest === i ? (
                        <p className="font-bold text-brand text-sm">{rank}</p>
                      ) : (
                        <MdRoute className="text-brand size-4 shrink-0" />
                      )}
                      <p className="text-neutral-700 dark:text-neutral-300 font-medium truncate">{routeName}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Peak Times */}
            <div className="bg-white dark:bg-neutral-950/60 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <h3 className="font-bold text-xs text-neutral-400 uppercase tracking-wider mb-4">
                Peak Times
              </h3>
              {peakTimes && <PeakTrafficChart peakTimes={peakTimes} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
