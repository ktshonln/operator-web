import { useState } from "react";
import TableTwo from "../components/TableTwo";
import useTickets, { TicketQuery } from "../hooks/useTickets";
import Filter from "../components/Filter";
import Search from "../components/Search";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

function TicketSaleHistory() {
  const [ticketQuery, setTicketQuery] = useState<TicketQuery>({
    page: 1,
    limit: 10,
  });

  const { data: tickets, isLoading } = useTickets(ticketQuery);

  const total = tickets?.total ?? tickets?.data?.length ?? tickets?.tickets?.length ?? 0;
  const page = ticketQuery.page ?? 1;
  const limit = ticketQuery.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handlePageChange = (newPage: number) => {
    setTicketQuery((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="mt-5 m-5 ml-3 dark:text-white h-screen">
      {/* Search and Filters Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="w-full md:max-w-md">
          <Search
            label="Search by ticket ID, passenger..."
            onSearch={(searchText) =>
              setTicketQuery((prev) => ({ ...prev, q: searchText, page: 1 }))
            }
          />
        </div>
        <div className="w-full md:w-auto">
          <Filter
            onSelectFilter={(filter) => {
              setTicketQuery((prev) => ({
                ...prev,
                startDate: filter.startDate,
                endDate: filter.endDate,
                page: 1,
              }));
            }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Ticket Sale History</h2>
        </div>

        {/* Table View */}
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">Loading tickets...</div>
        ) : (
          <div className="overflow-x-auto">
            <TableTwo tableData={(tickets?.tickets ?? tickets?.data ?? []) as any[]} click />
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Showing {Math.min((page - 1) * limit + 1, total)} to{" "}
            {Math.min(page * limit, total)} of {total} tickets
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1 border border-neutral-200 dark:border-neutral-700 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
            >
              <BiChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1 border border-neutral-200 dark:border-neutral-700 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
            >
              <BiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketSaleHistory;
