import { Link } from "react-router-dom";
import { BsCheck, BsX, BsEye } from "react-icons/bs";
import Can from "../components/Can";
import useUser from "../hooks/useUser";
import {
  useOrganizationApplications,
  useApproveOrganizationApplication,
  useRejectOrganizationApplication,
  OrganizationApplication,
} from "../hooks/useOrganizationApplicationsAdmin";

const OrganizationApplications = () => {
  const { user } = useUser();
  const { data, isLoading } = useOrganizationApplications();
  const applications = (data as unknown as OrganizationApplication[]) || [];
  const approveMutation = useApproveOrganizationApplication();
  const rejectMutation = useRejectOrganizationApplication();

  // Only allow admins to view this page
  if (!user || !user.roles?.includes("admin")) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Access denied. Only administrators can view organization applications.
        </p>
      </div>
    );
  }

  const handleApprove = (id: string) => {
    approveMutation.mutate({ id, status: "active" });
  };

  const handleReject = (id: string) => {
    if (window.confirm("Are you sure you want to reject this application?")) {
      rejectMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Organization Applications
        </h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading applications...</p>
        </div>
      ) : (
        <>
          {/* Applications Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app: OrganizationApplication) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {app.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        TIN: {app.tin} | License: {app.license_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {app.org_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{app.contact_email}</div>
                      <div className="text-gray-500">{app.contact_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                          app.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "active"
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
                          title="View Details"
                        >
                          <BsEye size={16} />
                        </Link>
                        <Can I="update" a="OrganizationApplication">
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                            disabled={approveMutation.isPending}
                          >
                            <BsCheck size={16} />
                          </button>
                        </Can>
                        <Can I="delete" a="OrganizationApplication">
                          <button
                            onClick={() => handleReject(app.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                            disabled={rejectMutation.isPending}
                          >
                            <BsX size={16} />
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
                <p className="text-gray-500">No pending applications found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrganizationApplications;
