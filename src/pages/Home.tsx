import { useState } from "react";
import { BsTicket } from "react-icons/bs";
import { MdRoute } from "react-icons/md";
import DonutChart from "../components/DonutChart";
import Filter from "../components/Filter";
import InsightCard from "../components/InsightCard";
import SellTicket from "../components/SellTicket";
import TableOne from "../components/TableOne";
import TableTwo from "../components/TableTwo";
import useAnalytics from "../hooks/useAnalytics";
import usePeakTimes from "../hooks/usePeakTimes";
import usePopularRoutes from "../hooks/usePopularRoutes";
import useRevenueAnalytics from "../hooks/useRevenueAnalytics";
import useTickets from "../hooks/useTickets";
import useUser from "../hooks/useUser";

export interface Route {
  origin: string;
  destination: string;
}

function HomePage() {
  const {
    data: analytics,
    error,
    isLoading,
  } = useAnalytics("comp_001", {
    endDate: "23/4/22",
    startDate: "23/4/22",
    branch: null,
  });
  const { data: revAnalytics } = useRevenueAnalytics("comp_001", {
    endDate: "23/4/22",
    startDate: "23/4/22",
    branch: null,
  });
  const { data: popularRoutes } = usePopularRoutes("comp_001", {
    endDate: "23/4/22",
    startDate: "23/4/22",
    branch: null,
  });
  const { data: peakTimes } = usePeakTimes("comp_001", {
    endDate: "23/4/22",
    startDate: "23/4/22",
    branch: null,
  });
  const { data: tickets } = useTickets({
    endDate: "23/4/22",
    startDate: "23/4/22",
  });
  console.log("Tickets:", tickets);
  console.log("Peak Times:", peakTimes);
  console.log("Popular Routes:", popularRoutes);
  console.log("Revenue Analytics:", revAnalytics);
  console.log("Analytics:", analytics);

  const { user } = useUser();
  const [sellTicket, setSellTicket] = useState(false);
  const fakedata = [100000, 100000, 100000, 100000, 100000];
  const data2 = [
    { route: { origin: "Kigali", destination: "Huye" }, revenue: 100000 },
    { route: { origin: "Kigali", destination: "Huye" }, revenue: 100000 },
    { route: { origin: "Kigali", destination: "Huye" }, revenue: 100000 },
    { route: { origin: "Kigali", destination: "Muhanga" }, revenue: 100000 },
    { route: { origin: "Kigali", destination: "Muhanga" }, revenue: 100000 },
    { route: { origin: "Kigali", destination: "Rubavu" }, revenue: 100000 },
    { route: { origin: "Kigali", destination: "Rubavu" }, revenue: 100000 },
  ];
  const data3 = [
    {
      ticketId: "678cc836ddc071f4e3ef9399",
      passengerName: "Jeanne Dowe",
      route: { origin: "Kigali", destination: "Huye" },
      paymentStatus: "pending",
      date: "12/09/2025 17:23",
    },
    {
      ticketId: "678cc836ddc071f4e3ef9399",
      passengerName: "Jeanne Dowe",
      route: { origin: "Kigali", destination: "Huye" },
      paymentStatus: "pending",
      date: "12/09/2025 17:23",
    },
    {
      ticketId: "678cc836ddc071f4e3ef9399",
      passengerName: "Jeanne Dowe",
      route: { origin: "Kigali", destination: "Huye" },
      paymentStatus: "received",
      date: "12/09/2025 17:23",
    },
  ];

  return (
    <div className="flex  space-x-3">
      {/* Dashboard */}
      <div className=" ml-3 mt-5 grow">
        <p className="font-bold text-2xl">
          Good morning, <span className="text-brand">{user.firstName}!</span>
        </p>
        <p className="text-sm text-brand2">
          Checkout real-time analytics and insights
        </p>
        <Filter />
        <div className="flex items-baseline justify-between gap-1">
          <InsightCard
            metric={345}
            Icon={BsTicket}
            title="Sold Tickets"
            action="View"
            variation={{ type: "up", value: 12 }}
          />
          <InsightCard
            metric={500}
            custIcon="/RWFIcon.svg"
            Icon={BsTicket}
            title="Total Revenue"
            variation={{ type: "down", value: 2 }}
            options={["money"]}
          />
          <InsightCard
            metric={845}
            Icon={BsTicket}
            title="Total Tickets"
            subtitle="500 available"
            action="- Sell ticket"
            effect={() => setSellTicket(true)}
            variation={{ type: "up", value: 8 }}
          />
        </div>
        <h2 className="font-semibold text-brand2 text-sm mt-5 mb-5">
          Revenue Breakdown Per Route
        </h2>
        <div className="border-1 border-neutral-200 rounded-xl flex max-w-2xl mx-auto  justify-between p-3">
          <DonutChart values={fakedata} currency="RWF" />
          <TableOne data={data2} />
        </div>
        <h2 className="font-semibold text-brand2 text-sm mt-5 mb-5">
          Pending and Completed transactions
        </h2>
        <div className="border-1 border-neutral-200 rounded-xl flex justify-between p-3">
          <TableTwo tableData={data3} />
        </div>
      </div>
      {/* Widgets */}
      <div className="w-1/5 justify-self-end">
        <div className="w-1/5 justify-self-end h-screen fixed top-0  p-3 shadow-lg rounded-r-md shadow-black/15">
          {/* Top destinations */}
          <h2 className="font-semibold text-brand2 text-sm mt-5 mb-5">
            Top destinations
          </h2>
          <div className="border-1 border-neutral-200 rounded-xl p-3 space-y-2">
            {data2.slice(0, 5).map(({ route }, i) => (
              <div
                key={i}
                className="flex items-center  space-x-4 p-3 bg-neutral-100 rounded-lg w-full text-xs "
              >
                <MdRoute className="text-brand size-4" />
                <p className="text-brand2">
                  {route.origin} - {route.destination}
                </p>
              </div>
            ))}
          </div>
          <h2 className="font-semibold text-brand2 text-sm mt-5 mb-5">
            Peak Hours
          </h2>
        </div>
      </div>
      {sellTicket && <SellTicket effectTwo={() => setSellTicket(false)} />}
    </div>
  );
}

export default HomePage;
