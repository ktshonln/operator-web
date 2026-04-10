import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BsPlus,
  BsEye,
  BsPencil,
  BsTrash,
  BsCheckCircle,
  BsXCircle,
} from "react-icons/bs";
import {
  useOrganizations,
  Organization,
  useDeleteOrganization,
  useApproveOrganization,
} from "../hooks/useOrganizations";
import Can from "../components/Can";

const Organizations = () => {
  const [statusFilter, setStatusFilter] = useState<
    Organization["status"] | "all"
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    Organization["org_type"] | "all"
  >("all");

  const queryResult = useOrganizations({
    status: statusFilter !== "all" ? statusFilter : undefined,
    org_type: typeFilter !== "all" ? typeFilter : undefined,
  });
  const organizations = (
    Array.isArray(queryResult.data) ? queryResult.data : []
  ) as Organization[];
  const { isLoading, error } = queryResult;

  const deleteOrg = useDeleteOrganization();
  const approveOrg = useApproveOrganization();

  const handleDelete = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      deleteOrg.mutate(id);
    }
  };

  const handleApprove = (id: string, action: "approve" | "reject") => {
    let reason: string | undefined = undefined;
    if (action === "reject") {
      const promptResult = prompt("Reason for rejection:");
      reason = promptResult ?? undefined;
    }
    approveOrg.mutate({ id, action, reason });
  };

  const getStatusBadge = (status: Organization["status"]): string => {
    const badges: Record<Organization["status"], string> = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      suspended: "bg-orange-100 text-orange-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load organizations</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <Can I="create" a="Organization">
          <Link
            to="/organizations/create"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <BsPlus size={20} />
            Add Organization
          </Link>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="company">Company</option>
            <option value="cooperative">Cooperative</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
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
            {organizations.map((org: Organization) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {org.logo_url && (
                      <img
                        className="h-10 w-10 rounded-full mr-3"
                        src={org.logo_url}
                        alt={org.name}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {org.name}
                      </div>
                      <div className="text-sm text-gray-500">@{org.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 capitalize">
                    {org.org_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(org.status)}`}
                  >
                    {org.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{org.contact_email}</div>
                  {org.contact_phone && (
                    <div className="text-gray-500">{org.contact_phone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(org.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/organizations/${org.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="View"
                    >
                      <BsEye size={16} />
                    </Link>
                    <Can I="update" a="Organization">
                      <Link
                        to={`/organizations/${org.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <BsPencil size={16} />
                      </Link>
                    </Can>
                    {org.status === "pending" && (
                      <Can I="approve" a="Organization">
                        <>
                          <button
                            onClick={() => handleApprove(org.id, "approve")}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                            disabled={approveOrg.isPending}
                          >
                            <BsCheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleApprove(org.id, "reject")}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                            disabled={approveOrg.isPending}
                          >
                            <BsXCircle size={16} />
                          </button>
                        </>
                      </Can>
                    )}
                    <Can I="delete" a="Organization">
                      <button
                        onClick={() => handleDelete(org.id, org.name)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                        disabled={deleteOrg.isPending}
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

        {organizations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No organizations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Organizations;
