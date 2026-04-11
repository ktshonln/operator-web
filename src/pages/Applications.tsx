import { useState } from "react";
import { Link } from "react-router-dom";
import { BsPlus, BsEye, BsPencil, BsTrash } from "react-icons/bs";
import Can from "../components/Can";
import useUser from "../hooks/useUser";

interface Application {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  created_at: string;
}

// Mock data for now
const mockApplications: Application[] = [
  {
    id: "app_1",
    name: "Ticketing System",
    description: "Manage tickets and sales",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "app_2",
    name: "Fleet Management",
    description: "Manage buses and drivers",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
  },
];

const Applications = () => {
  const { user } = useUser();
  const [applications] = useState<Application[]>(mockApplications);

  // Only allow admins to view this page
  if (!user || !user.roles?.includes("admin")) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Access denied. Only administrators can view applications.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <Can I="create" a="Application">
          <Link
            to="/applications/create"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <BsPlus size={20} />
            Add Application
          </Link>
        </Can>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {app.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {app.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      app.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/applications/${app.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="View"
                    >
                      <BsEye size={16} />
                    </Link>
                    <Can I="update" a="Application">
                      <Link
                        to={`/applications/${app.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <BsPencil size={16} />
                      </Link>
                    </Can>
                    <Can I="delete" a="Application">
                      <button
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <BsTrash size={16} />
                      </button>
                    </Can>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No applications found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
