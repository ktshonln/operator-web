import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { useCreateOrganization, Organization } from "../hooks/useOrganizations";
import Can from "../components/Can";

const CreateOrganization = () => {
  const navigate = useNavigate();
  const createOrg = useCreateOrganization();
  const [formData, setFormData] = useState<Partial<Organization>>({
    org_type: "company",
    status: "pending",
  });

  const handleChange = (field: keyof Organization, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: formData.name || "",
      org_type: (formData.org_type as Organization["org_type"]) ?? "company",
      contact_email: formData.contact_email || "",
      contact_phone: formData.contact_phone,
      logo_url: formData.logo_url,
      address: formData.address,
      parent_org_id: formData.parent_org_id ?? undefined,
    };

    createOrg.mutate(payload, {
      onSuccess: () => {
        navigate("/organizations");
      },
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/organizations"
            className="text-gray-600 hover:text-gray-900"
          >
            <BsArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Organization
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Add a new organization and configure its details.
            </p>
          </div>
        </div>
      </div>

      <Can I="create" a="Organization">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization name
              </label>
              <input
                type="text"
                value={formData.name ?? ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization type
              </label>
              <select
                value={formData.org_type ?? "company"}
                onChange={(e) => handleChange("org_type", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="company">Company</option>
                <option value="cooperative">Cooperative</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact email
              </label>
              <input
                type="email"
                value={formData.contact_email ?? ""}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact phone
              </label>
              <input
                type="tel"
                value={formData.contact_phone ?? ""}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows={4}
              value={formData.address ?? ""}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logo_url ?? ""}
              onChange={(e) => handleChange("logo_url", e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={createOrg.isPending}
            className="bg-blue-500 text-white px-5 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {createOrg.isPending ? "Creating..." : "Create Organization"}
          </button>
        </form>
      </Can>
    </div>
  );
};

export default CreateOrganization;
