import { BsTicket } from "react-icons/bs";
import Filter from "../components/Filter";
import InsightCard from "../components/InsightCard";
import DonutChart from "../components/DonutChart";

function HomePage() {
  const data = [100000, 100000, 100000, 100000, 100000];

  return (
    <div className="w-2xl">
      {/* Dashboard */}
      <p className="font-bold text-2xl">
        Good morning, <span className="text-brand">Alicia!</span>
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
          variation={{ type: "up", value: 8 }}
        />
      </div>
      <h2 className="font-semibold text-brand2 text-sm mt-5 mb-5">
        Revenue Breakdown Per Route
      </h2>
      <div className="border-1 border-neutral-200 rounded-xl flex justify-between p-3">
        <DonutChart values={data} currency="RWF" />
        <table className=" text-xs">
          <tr>
            <th></th>
          </tr>
          <tr>
            <td className="flex items-center justify-between space-x-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-brand2 bg-brand rounded-full" />
                <p className="text-brand2">Kigali - Huye</p>
              </div>
              <p>
                {" "}
                Rwf <span className="font-semibold">82, 700</span>
              </p>
            </td>
            <td className="flex items-center justify-between space-x-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-brand2 bg-brand rounded-full" />
                <p className="text-brand2">Kigali - Muhanga</p>
              </div>
              <p>
                {" "}
                Rwf <span className="font-semibold">82, 700</span>
              </p>
            </td>
          </tr>
          <tr>
            <td>hi2</td>
          </tr>
          <tr>
            <td>hi3</td>
          </tr>
        </table>
      </div>
      {/* Widgets */}
    </div>
  );
}

export default HomePage;
