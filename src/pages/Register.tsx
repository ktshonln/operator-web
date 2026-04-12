import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useState } from "react";
import Footer from "../components/Footer";
import { useToastStore } from "../stores/toastStore";
import useSubmitOrganizationApplication, {
  getOrganizationApplicationDocumentPresignedUrl,
  OrganizationApplicationPayload,
} from "../hooks/useOrganizationApplications";
import { axiosInstance } from "../services/apiClient";

const OrganizationSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  org_type: z.enum(["company", "cooperative"]),
  tin: z.string().min(3, {
    message: "Tax ID must be set and at least 3 characters.",
  }),
  license_number: z.string().min(3, {
    message: "License number must be set.",
  }),
  contact_email: z.string().email({ message: "Please enter a valid email." }),
  contact_phone: z.string().min(10, {
    message: "Please enter a valid E.164 phone number.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  parent_org_id: z.string().optional().or(z.literal("")),
});

export const FullSchema = OrganizationSchema.extend({
  userId: z.string(),
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});
export type RegistrationData = z.infer<typeof OrganizationSchema>;
export type FullRegistrationData = z.infer<typeof FullSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [businessCertificateFile, setBusinessCertificateFile] =
    useState<File | null>(null);
  const [repIdFile, setRepIdFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationData>({ resolver: zodResolver(OrganizationSchema) });

  const submitApplication = useSubmitOrganizationApplication();

  const onLogoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const onBusinessCertificateSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusinessCertificateFile(file);
  };

  const onRepIdSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setRepIdFile(file);
  };

  const onSubmit = async (data: RegistrationData) => {
    if (!businessCertificateFile || !repIdFile) {
      showToast("Please upload both required application documents.", "error");
      return;
    }

    try {
      const businessCertUrl =
        await getOrganizationApplicationDocumentPresignedUrl(
          "business_certificate",
          businessCertificateFile.type,
        );
      await fetch(businessCertUrl.upload_url, {
        method: "PUT",
        body: businessCertificateFile,
        headers: {
          "Content-Type": businessCertificateFile.type,
        },
      });

      const repIdUrl = await getOrganizationApplicationDocumentPresignedUrl(
        "rep_id",
        repIdFile.type,
      );
      await fetch(repIdUrl.upload_url, {
        method: "PUT",
        body: repIdFile,
        headers: {
          "Content-Type": repIdFile.type,
        },
      });

      let logo_path: string | undefined;
      if (logoFile) {
        const presignedResponse = await axiosInstance.post<{
          uploadUrl: string;
          fileUrl: string;
        }>("/api/v1/uploads/presigned-url", {
          file_name: logoFile.name,
          content_type: logoFile.type,
        });

        await fetch(presignedResponse.data.uploadUrl, {
          method: "PUT",
          body: logoFile,
          headers: {
            "Content-Type": logoFile.type,
          },
        });

        logo_path = presignedResponse.data.fileUrl;
      }

      const payload: OrganizationApplicationPayload = {
        ...data,
        parent_org_id: data.parent_org_id || undefined,
        business_certificate_path: businessCertUrl.path,
        rep_id_path: repIdUrl.path,
        logo_path,
      };

      submitApplication.mutate(payload, {
        onSuccess: (response) => {
          reset();
          setLogoFile(null);
          setLogoPreview("");
          setBusinessCertificateFile(null);
          setRepIdFile(null);
          if (response?.org_id) {
            navigate(
              `/register/verify?org_id=${encodeURIComponent(response.org_id)}`,
            );
          } else {
            navigate("/register/success");
          }
        },
      });
    } catch (error) {
      console.error(error);
      showToast("Failed to upload documents or submit application.", "error");
    }
  };

  return (
    <div className="relative bg-[#0A4370] font-heebo">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="aspect-[614/1024] absolute lg:w-1/2 bottom-0 "
        viewBox="0 0 614 1024"
        fill="none"
      >
        <path d="M0 0H614L436.5 1024H0V0Z" fill="#041D33" />
      </svg>
      <div className="p-2 pt-10 sm:p-10 sm:pr-32 sm:pl-32">
        <div className="bg-white relative drop-shadow-lg drop-shadow-black/25 rounded-2xl w-full max-w-screen flex justify-between">
          <div className="w-full">
            <img
              src="/logoOne.svg"
              className="w-32 ml-5 mt-2 pt-5"
              alt="Katisha-logo"
            />
            <h1 className="w-fit mx-auto font-bold text-2xl -mt-5 mb-5">
              Create your account
            </h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="text-xs justify-self-center w-full px-32"
            >
              <div className="flex flex-col gap-6">
                <h2 className="font-bold text-base mb-4">
                  Organization details
                </h2>

                <label
                  htmlFor="name"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Name
                </label>
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}

                <label
                  htmlFor="org_type"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Organization Type
                </label>
                <select
                  {...register("org_type")}
                  id="org_type"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                  defaultValue="company"
                >
                  <option value="company">Company</option>
                  <option value="cooperative">Cooperative</option>
                </select>
                {errors.org_type && (
                  <p className="text-red-500 text-xs">
                    {errors.org_type.message}
                  </p>
                )}

                <label
                  htmlFor="tin"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Tax Identification Number (TIN)
                </label>
                <input
                  {...register("tin")}
                  type="text"
                  id="tin"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                />
                {errors.tin && (
                  <p className="text-red-500 text-xs">{errors.tin.message}</p>
                )}

                <label
                  htmlFor="license_number"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  License Number
                </label>
                <input
                  {...register("license_number")}
                  type="text"
                  id="license_number"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                />
                {errors.license_number && (
                  <p className="text-red-500 text-xs">
                    {errors.license_number.message}
                  </p>
                )}

                <label
                  htmlFor="contact_email"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Official email
                </label>
                <input
                  {...register("contact_email")}
                  type="email"
                  id="contact_email"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                />
                {errors.contact_email && (
                  <p className="text-red-500 text-xs">
                    {errors.contact_email.message}
                  </p>
                )}

                <label
                  htmlFor="contact_phone"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Contact phone
                </label>
                <input
                  {...register("contact_phone")}
                  type="text"
                  id="contact_phone"
                  placeholder="+2507xxxxxxx"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                />
                {errors.contact_phone && (
                  <p className="text-red-500 text-xs">
                    {errors.contact_phone.message}
                  </p>
                )}

                <label
                  htmlFor="address"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Address
                </label>
                <textarea
                  {...register("address")}
                  id="address"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs">
                    {errors.address.message}
                  </p>
                )}

                <label
                  htmlFor="business_certificate"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Business certificate (PDF)
                </label>
                <input
                  id="business_certificate"
                  type="file"
                  accept="application/pdf"
                  onChange={onBusinessCertificateSelected}
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                />
                {businessCertificateFile && (
                  <p className="text-gray-500 text-xs mt-1">
                    Selected: {businessCertificateFile.name}
                  </p>
                )}

                <label
                  htmlFor="rep_id"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Representative ID (PDF, JPG, PNG, or WEBP)
                </label>
                <input
                  id="rep_id"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={onRepIdSelected}
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                />
                {repIdFile && (
                  <p className="text-gray-500 text-xs mt-1">
                    Selected: {repIdFile.name}
                  </p>
                )}

                <label
                  htmlFor="parent_org_id"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Parent Organization ID (optional)
                </label>
                <input
                  {...register("parent_org_id")}
                  type="text"
                  id="parent_org_id"
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                />

                <label
                  htmlFor="logo"
                  className="text-[#6A717D] block mb-0.5 text-xs"
                >
                  Logo (optional)
                </label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={onLogoSelected}
                  className="ring ring-gray-200 p-2 rounded-xs bg-white w-full outline-none"
                />
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-24 mt-2 object-contain"
                  />
                )}

                <button
                  disabled={submitApplication.isPending}
                  type="submit"
                  className="bg-[#0A4370] p-2 block w-full text-white mt-6 rounded-sm cursor-pointer hover:text-[#0A4370] hover:bg-white hover:ring hover:ring-[#0A4370] active:scale-95 disabled:active:scale-none disabled:hover:ring-0 disabled:opacity-50 disabled:hover:bg-[#0A4370] disabled:hover:text-white disabled:cursor-not-allowed"
                >
                  {submitApplication.isPending ? "REGISTERING..." : "REGISTER"}
                </button>
              </div>
            </form>
            <p className="text-xs w-fit pb-3 mt-10 mx-auto sm:ml-12">
              Already have an account?
              <Link to={"/"} className="text-brand cursor-pointer">
                {" "}
                Login
              </Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default RegisterPage;
