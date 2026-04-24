import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useState, useMemo } from "react";
import Footer from "../components/Footer";
import { useToastStore } from "../stores/toastStore";
import useSubmitOrganizationApplication, {
  getOrganizationApplicationDocumentPresignedUrl,
  OrganizationApplicationPayload,
} from "../hooks/useOrganizationApplications";
import { useOrganizations } from "../hooks/useOrganizations";

const OrganizationSchema = z.object({
  name: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  org_type: z.enum(["company", "cooperative", "coop_member"]),
  contact_first_name: z.string().min(1, { message: "Contact first name is required." }),
  contact_last_name: z.string().min(1, { message: "Contact last name is required." }),
  contact_email: z.string().email({ message: "Please enter a valid email." }),
  contact_phone: z.string().min(10, { message: "Please enter a valid E.164 phone number (e.g. +250788000001)." }),
  tin: z.string().min(9, { message: "TIN must be exactly 9 digits." }).max(9),
  license_number: z.string().min(3, { message: "License number is required." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  parent_org_id: z.string().optional().or(z.literal("")),
});

export type RegistrationData = z.infer<typeof OrganizationSchema>;

const inputClass = "ring ring-gray-200 p-2 rounded-sm bg-white w-full outline-none text-sm focus:ring-brand transition-colors";
const labelClass = "text-[#6A717D] block mb-1 text-xs font-medium";
const errorClass = "text-red-500 text-xs mt-1";

const RegisterPage = () => {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const [businessCertificateFile, setBusinessCertificateFile] = useState<File | null>(null);
  const [repIdFile, setRepIdFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState("");

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<RegistrationData>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: { org_type: "company" },
  });

  const orgType = watch("org_type");
  const orgName = watch("name");
  const submitApplication = useSubmitOrganizationApplication();

  // Slug preview (same as CreateOrganization.tsx)
  const slugPreview = orgName ? orgName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") : "";

  // Fetch active cooperatives for parent org selector
  const cooperativesQuery = useOrganizations({ status: "active", org_type: "cooperative" });
  const activeCooperatives = useMemo(() => {
    const result = cooperativesQuery.data as { data: any[] } | any[] | undefined;
    if (Array.isArray(result)) return result;
    return result?.data ?? [];
  }, [cooperativesQuery.data]);

  const onSubmit = async (data: RegistrationData) => {
    if (!businessCertificateFile || !repIdFile) {
      showToast("Please upload both required documents.", "error");
      return;
    }

    setSubmitError("");

    try {
      // Step 1: Get presigned URLs for both documents
      const [certPresigned, repIdPresigned] = await Promise.all([
        getOrganizationApplicationDocumentPresignedUrl("business_certificate", businessCertificateFile.type),
        getOrganizationApplicationDocumentPresignedUrl("rep_id", repIdFile.type),
      ]);

      // Step 2: Upload both documents directly to storage
      await Promise.all([
        fetch(certPresigned.upload_url, { method: "PUT", body: businessCertificateFile, headers: { "Content-Type": businessCertificateFile.type } }),
        fetch(repIdPresigned.upload_url, { method: "PUT", body: repIdFile, headers: { "Content-Type": repIdFile.type } }),
      ]);

      // Step 3: Submit application with document paths
      const payload: OrganizationApplicationPayload = {
        name: data.name,
        org_type: data.org_type,
        contact_first_name: data.contact_first_name,
        contact_last_name: data.contact_last_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        tin: data.tin,
        license_number: data.license_number,
        address: data.address,
        parent_org_id: data.parent_org_id || undefined,
        business_certificate_path: certPresigned.path,
        rep_id_path: repIdPresigned.path,
      };

      submitApplication.mutate(payload, {
        onSuccess: (response) => {
          reset();
          setBusinessCertificateFile(null);
          setRepIdFile(null);
          if (response?.org_id) {
            navigate(`/register/verify?org_id=${encodeURIComponent(response.org_id)}&org_name=${encodeURIComponent(data.name)}&org_type=${encodeURIComponent(data.org_type)}`);
          } else {
            navigate("/register/success");
          }
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          let message = "Failed to submit application. Please try again.";
          
          if (code === "ORG_ALREADY_EXISTS") {
            message = "An organization with this name already exists.";
          } else if (code === "CONTACT_PHONE_ALREADY_REGISTERED") {
            message = "This contact phone number is already registered.";
          } else if (code === "CONTACT_EMAIL_ALREADY_REGISTERED") {
            message = "This contact email is already registered.";
          } else {
            message = err?.response?.data?.error?.message || err?.message || message;
          }
          
          setSubmitError(message);
          showToast(message, "error");
        },
      });
    } catch (error) {
      console.error(error);
      const message = "Failed to upload documents or submit application.";
      setSubmitError(message);
      showToast(message, "error");
    }
  };

  return (
    <div className="relative bg-[#0A4370] font-heebo min-h-screen">
      <svg xmlns="http://www.w3.org/2000/svg" className="aspect-[614/1024] absolute lg:w-1/2 bottom-0 pointer-events-none" viewBox="0 0 614 1024" fill="none">
        <path d="M0 0H614L436.5 1024H0V0Z" fill="#041D33" />
      </svg>

      <div className="relative p-4 pt-8 sm:p-8 md:p-12">
        <div className="bg-white drop-shadow-lg rounded-2xl w-full max-w-2xl mx-auto">
          <div className="p-6 sm:p-10">
            <img src="/logoOne.svg" className="w-28 mb-6" alt="Katisha" />
            
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium text-brand">Application Details</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300 mx-2"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-500">Verify Contact</span>
                </div>
              </div>
            </div>

            <h1 className="font-bold text-2xl mb-1 text-[#0A4370]">Apply for membership</h1>
            <p className="text-sm text-[#6A717D] mb-8">Submit your organization's application to join the Katisha platform.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Organization details */}
              <h2 className="font-semibold text-sm text-neutral-700 uppercase tracking-wide">Organization</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Organization name *</label>
                  <input {...register("name")} type="text" className={inputClass} />
                  {orgName && (
                    <p className="mt-1 text-xs text-neutral-400 font-mono">
                      slug: <span className="text-neutral-500">{slugPreview}</span>
                    </p>
                  )}
                  {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Organization type *</label>
                  <select {...register("org_type")} className={inputClass}>
                    <option value="company">Company</option>
                    <option value="cooperative">Cooperative</option>
                    <option value="coop_member">Cooperative Member</option>
                  </select>
                  {errors.org_type && <p className={errorClass}>{errors.org_type.message}</p>}
                </div>
              </div>

              {orgType === "coop_member" && (
                <div>
                  <label className={labelClass}>Parent Cooperative *</label>
                  <select {...register("parent_org_id")} className={inputClass}>
                    <option value="">Select a cooperative...</option>
                    {activeCooperatives.map((coop: any) => (
                      <option key={coop.id} value={coop.id}>{coop.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-400 mt-1">Must be an active cooperative.</p>
                  {errors.parent_org_id && <p className={errorClass}>{errors.parent_org_id.message}</p>}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>TIN (9 digits) *</label>
                  <input {...register("tin")} type="text" maxLength={9} placeholder="123456789" className={inputClass} />
                  {errors.tin && <p className={errorClass}>{errors.tin.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>License number *</label>
                  <input {...register("license_number")} type="text" className={inputClass} />
                  {errors.license_number && <p className={errorClass}>{errors.license_number.message}</p>}
                </div>
              </div>

              <div>
                <label className={labelClass}>Address *</label>
                <textarea {...register("address")} rows={2} className={inputClass} />
                {errors.address && <p className={errorClass}>{errors.address.message}</p>}
              </div>

              {/* Contact person */}
              <h2 className="font-semibold text-sm text-neutral-700 uppercase tracking-wide pt-2">Contact Person</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>First name *</label>
                  <input {...register("contact_first_name")} type="text" className={inputClass} />
                  {errors.contact_first_name && <p className={errorClass}>{errors.contact_first_name.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Last name *</label>
                  <input {...register("contact_last_name")} type="text" className={inputClass} />
                  {errors.contact_last_name && <p className={errorClass}>{errors.contact_last_name.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Official email *</label>
                  <input {...register("contact_email")} type="email" className={inputClass} />
                  {errors.contact_email && <p className={errorClass}>{errors.contact_email.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Contact phone *</label>
                  <input {...register("contact_phone")} type="text" placeholder="+250788000001" className={inputClass} />
                  {errors.contact_phone && <p className={errorClass}>{errors.contact_phone.message}</p>}
                </div>
              </div>

              {/* Documents */}
              <h2 className="font-semibold text-sm text-neutral-700 uppercase tracking-wide pt-2">Documents</h2>

              <div>
                <label className={labelClass}>Business certificate (PDF) *</label>
                <input type="file" accept="application/pdf" onChange={e => setBusinessCertificateFile(e.target.files?.[0] ?? null)} className={inputClass} />
                {!businessCertificateFile && <p className="text-xs text-neutral-400 mt-1">Required</p>}
                {businessCertificateFile && <p className="text-xs text-green-600 mt-1">✓ {businessCertificateFile.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Representative ID (PDF, JPG, PNG, WEBP) *</label>
                <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => setRepIdFile(e.target.files?.[0] ?? null)} className={inputClass} />
                {!repIdFile && <p className="text-xs text-neutral-400 mt-1">Required</p>}
                {repIdFile && <p className="text-xs text-green-600 mt-1">✓ {repIdFile.name}</p>}
              </div>

              {submitError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {submitError}
                </div>
              )}

              <button
                disabled={submitApplication.isPending}
                type="submit"
                className="w-full bg-[#0A4370] text-white py-3 rounded-lg font-medium hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
              >
                {submitApplication.isPending ? "Submitting..." : "Submit Application"}
              </button>
            </form>

            <p className="text-xs text-center mt-6 text-neutral-500">
              Already have an account?{" "}
              <Link to="/login" className="text-brand hover:underline">Login</Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default RegisterPage;
