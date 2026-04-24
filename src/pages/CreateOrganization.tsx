import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { useCreateOrganization, CreateOrganizationPayload, useOrganizations } from "../hooks/useOrganizations";
import Can from "../components/Can";
import { axiosInstance } from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

const CreateOrganization = () => {
  const navigate = useNavigate();
  const createOrg = useCreateOrganization();
  const { showToast } = useToastStore();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<CreateOrganizationPayload>>({
    org_type: "company",
  });

  // Fetch active cooperatives for parent org selector
  const cooperativesQuery = useOrganizations({ status: "active", org_type: "cooperative" });
  const activeCooperatives = useMemo(() => {
    const result = cooperativesQuery.data as { data: any[] } | any[] | undefined;
    if (Array.isArray(result)) return result;
    return result?.data ?? [];
  }, [cooperativesQuery.data]);

  const set = (field: keyof CreateOrganizationPayload, value: string) => {
    setError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsUploading(true);

    const payload: CreateOrganizationPayload = {
      name: form.name ?? "",
      org_type: form.org_type ?? "company",
      contact_first_name: form.contact_first_name ?? "",
      contact_last_name: form.contact_last_name ?? "",
      contact_email: form.contact_email ?? "",
      contact_phone: form.contact_phone ?? "",
      tin: form.tin ?? "",
      license_number: form.license_number || undefined,
      address: form.address || undefined,
      parent_org_id: form.org_type === "coop_member" ? (form.parent_org_id || undefined) : undefined,
    };

    createOrg.mutate(payload, {
      onSuccess: async (createdOrg) => {
        // Upload logo after org is created (we need the org ID for the presigned URL)
        if (logoFile && createdOrg?.id) {
          try {
            const accepted = ["image/jpeg", "image/png", "image/webp"];
            const contentType = accepted.includes(logoFile.type) ? logoFile.type : "image/jpeg";
            const { data: presigned } = await axiosInstance.get<{ upload_url: string; path: string }>(
              `/organizations/${createdOrg.id}/logo/presigned-url`,
              { params: { content_type: contentType } }
            );
            await fetch(presigned.upload_url, {
              method: "PUT",
              body: logoFile,
              headers: { "Content-Type": contentType },
            });
            await axiosInstance.patch(`/organizations/${createdOrg.id}`, { logo_path: presigned.path });
          } catch (err) {
            console.error("Logo upload failed (org was created)", err);
          }
        }
        setIsUploading(false);
        showToast("Organization created successfully", "success");
        navigate(`/organizations/${createdOrg.id}`);
      },
      onError: (err: any) => {
        setIsUploading(false);
        const code = err?.response?.data?.error?.code;
        if (code === "ORG_NAME_EXISTS") {
          setError("An organization with this name already exists.");
        } else if (code === "CONTACT_PHONE_EXISTS") {
          setError("This contact phone number is already registered.");
        } else if (code === "CONTACT_EMAIL_EXISTS") {
          setError("This contact email is already registered.");
        } else {
          setError("Failed to create organization. Please try again.");
        }
      },
    });
  };

  const inputClass = "w-full border border-gray-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1";

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/organizations" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <BsArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Organization</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Add a new organization to the platform.</p>
        </div>
      </div>

      <Can I="create" a="Organization">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Org name + type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Organization name <span className="text-red-500">*</span></label>
              <input type="text" required value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Organization type <span className="text-red-500">*</span></label>
              <select required value={form.org_type ?? "company"} onChange={(e) => set("org_type", e.target.value)} className={inputClass}>
                <option value="company">Company</option>
                <option value="cooperative">Cooperative</option>
                <option value="coop_member">Cooperative Member</option>
              </select>
            </div>
          </div>

          {/* coop_member: parent org dropdown */}
          {form.org_type === "coop_member" && (
            <div>
              <label className={labelClass}>Parent Cooperative <span className="text-red-500">*</span></label>
              <select
                required
                value={form.parent_org_id ?? ""}
                onChange={(e) => set("parent_org_id", e.target.value)}
                className={inputClass}
              >
                <option value="">Select a cooperative...</option>
                {activeCooperatives.map((coop: any) => (
                  <option key={coop.id} value={coop.id}>{coop.name}</option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">Must be an active cooperative.</p>
            </div>
          )}

          {/* Contact person */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Contact first name <span className="text-red-500">*</span></label>
              <input type="text" required value={form.contact_first_name ?? ""} onChange={(e) => set("contact_first_name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact last name <span className="text-red-500">*</span></label>
              <input type="text" required value={form.contact_last_name ?? ""} onChange={(e) => set("contact_last_name", e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Contact details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Contact email <span className="text-red-500">*</span></label>
              <input type="email" required value={form.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact phone <span className="text-red-500">*</span></label>
              <input type="tel" required value={form.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)}
                placeholder="+250788000001" pattern="^\+\d{7,15}$" title="E.164 format e.g. +250788000001" className={inputClass} />
            </div>
          </div>

          {/* TIN + License */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>TIN <span className="text-red-500">*</span></label>
              <input type="text" required value={form.tin ?? ""} onChange={(e) => set("tin", e.target.value)}
                placeholder="123456789" pattern="^\d{9}$" maxLength={9} title="Exactly 9 digits" className={inputClass} />
              <p className="text-xs text-neutral-500 mt-1">Exactly 9 digits.</p>
            </div>
            <div>
              <label className={labelClass}>License number</label>
              <input type="text" value={form.license_number ?? ""} onChange={(e) => set("license_number", e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>Address</label>
            <textarea rows={3} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} className={inputClass} />
          </div>

          {/* Logo */}
          <div>
            <label className={labelClass}>Logo <span className="text-xs text-neutral-400">(optional — uploaded after creation)</span></label>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-neutral-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-neutral-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => document.getElementById("logo-upload")?.click()}
              >
                {logoFile ? (
                  <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400 text-center px-2">Click to upload</span>
                )}
              </div>
              <div className="flex-1">
                <input id="logo-upload" type="file" accept={ACCEPTED_IMAGE_TYPES} className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoFile(f); }} />
                <p className="text-xs text-neutral-500 mb-1">JPEG, PNG or WebP. Recommended 256×256px.</p>
                {logoFile && (
                  <button type="button" onClick={() => setLogoFile(null)} className="text-xs text-red-500 hover:text-red-700">
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={createOrg.isPending || isUploading}
            className="bg-brand text-white px-6 py-2.5 rounded-lg hover:brightness-95 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {createOrg.isPending || isUploading ? "Creating..." : "Create Organization"}
          </button>
        </form>
      </Can>
    </div>
  );
};

export default CreateOrganization;
