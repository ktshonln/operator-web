import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BsArrowLeft, BsPencil, BsSave, BsX } from "react-icons/bs";
import {
  useOrganizationById,
  useUpdateOrganization,
  Organization,
  UpdateOrganizationPayload,
} from "../hooks/useOrganizations";
import Can from "../components/Can";

const OrganizationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Organization>>({});

  const { data: organization, isLoading, error } = useOrganizationById(id!);
  const updateOrg = useUpdateOrganization();

  const handleEdit = () => {
    if (organization) {
      setFormData(organization);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (id && formData) {
      const updateData: UpdateOrganizationPayload = {
        name: formData.name,
        org_type: formData.org_type,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        logo_url: formData.logo_url,
        address: formData.address,
        parent_org_id: formData.parent_org_id ?? undefined,
        status: formData.status,
      };
      updateOrg.mutate(
        { id, data: updateData },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        },
      );
    }
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Organization, value: string) => {
    setFormData((prev: Partial<Organization>) => ({ ...prev, [field]: value }));
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
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Organization not found</p>
          <Link
            to="/organizations"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/organizations"
            className="text-gray-600 hover:text-gray-900"
          >
            <BsArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {organization.name}
          </h1>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(organization.status)}`}
          >
            {organization.status}
          </span>
        </div>
        <Can I="update" a="Organization">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <BsPencil size={16} />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={updateOrg.isPending}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
              >
                <BsSave size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
              >
                <BsX size={16} />
                Cancel
              </button>
            </div>
          )}
        </Can>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="w-24 h-24 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                No Logo
              </div>
            )}
          </div>

          {/* Organization Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">{organization.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <p className="text-gray-500">@{organization.slug}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              {isEditing ? (
                <select
                  value={formData.org_type || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "org_type",
                      e.target.value as Organization["org_type"],
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="company">Company</option>
                  <option value="cooperative">Cooperative</option>
                </select>
              ) : (
                <p className="text-gray-900 capitalize">
                  {organization.org_type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(organization.status)}`}
              >
                {organization.status}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.contact_email || ""}
                  onChange={(e) =>
                    handleInputChange("contact_email", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">{organization.contact_email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.contact_phone || ""}
                  onChange={(e) =>
                    handleInputChange("contact_phone", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">
                  {organization.contact_phone || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">
                  {organization.address || "Not provided"}
                </p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created
              </label>
              <p className="text-gray-500">
                {new Date(organization.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <p className="text-gray-500">
                {new Date(organization.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetails;
