import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { camelCaseToTitle } from "../utils/helpers";
import { useState } from "react";
import { BsBuilding } from "react-icons/bs";
import { BiWorld, BiUser } from "react-icons/bi";
import { Role, useRoleById } from "../hooks/useRoles";
import { Permission } from "../hooks/usePermissions";
import { axiosInstance } from "../services/apiClient";
import { useToastStore } from "../stores/toastStore";
import { useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_USERS } from "../utils/constants";
import useUser from "../hooks/useUser";
import { useOrganizations } from "../hooks/useOrganizations";

export interface GrantDisplay {
  pattern: string;
  displayName: string;
  description: string;
  scope: string;
}

function buildGrantDisplay(pattern: string, permissionOptions: Permission[]): GrantDisplay {
  const parts = pattern.split(":");
  const scope = parts.length >= 3 ? parts.pop() || "" : "";
  const code = parts.join(":");
  const perm = permissionOptions.find((p) => p.code === code);
  let fallbackName = code;
  if (code === "*:*") fallbackName = "Full Access";
  else if (code.includes(":")) {
    const [subject, action] = code.split(":");
    if (subject && action) {
      const capAction = action.charAt(0).toUpperCase() + action.slice(1);
      const pluralSubject = subject.endsWith("s") ? subject : `${subject}s`;
      fallbackName = `${capAction} ${pluralSubject}`;
    }
  }
  return {
    pattern,
    displayName: perm ? perm.display_name : fallbackName,
    description: perm?.description ?? "No description provided by backend catalog.",
    scope,
  };
}

// At least one of phone or email required
const schema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal("")),
  phoneNumber: z.string().regex(/^\+\d{7,15}$/, { message: "E.164 format required (e.g. +250788000001)" }).optional().or(z.literal("")),
  role: z.string().min(1, { message: "Please select a user role." }),
  locale: z.enum(["rw", "en", "fr"]),
  orgId: z.string().optional(),
}).refine(d => d.email || d.phoneNumber, {
  message: "At least one of phone or email is required.",
  path: ["phoneNumber"],
});

type FormData = z.infer<typeof schema>;

interface InviteSuccess {
  firstName: string;
  lastName: string;
  maskedPhone?: string;
  maskedEmail?: string;
  expiresAt?: string;
}

interface Props {
  companyId: string;
  userId: string;
  roles: Role[];
  permissionOptions: Permission[];
}

const LOCALES = [
  { value: "rw", label: "Kinyarwanda" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
] as const;

const inputClass = "ring ring-gray-200 dark:ring-neutral-700 p-2 rounded-sm bg-white dark:bg-neutral-900 dark:text-white w-full outline-none text-sm focus:ring-brand transition-colors";
const labelClass = "block mb-1 font-medium dark:text-white text-sm";

const AddAgent = ({ companyId, roles, permissionOptions }: Props) => {
  const { user } = useUser();
  const isSuperAdmin = user && "roles" in user && user.roles?.includes("platform-admin");
  const orgQueryResult = useOrganizations({});
  const allOrgs = (Array.isArray(orgQueryResult.data) 
    ? orgQueryResult.data 
    : (orgQueryResult.data as any)?.data ?? []) as any[];

  const [success, setSuccess] = useState<InviteSuccess | null>(null);
  const [inlineError, setInlineError] = useState("");
  const { showToast } = useToastStore();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, reset, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", phoneNumber: "", role: roles[0]?.slug ?? "", locale: "rw", orgId: companyId },
    mode: "onChange",
  });

  const selectedRoleSlug = watch("role");
  const selectedRole = roles.find((r) => r.slug === selectedRoleSlug);
  const { data: roleDetail, isLoading: grantsLoading } = useRoleById(selectedRole?.id ?? "");
  const grants: GrantDisplay[] = (roleDetail?.grants ?? []).map((g) => buildGrantDisplay(g.pattern, permissionOptions));

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: FormData) => {
    setInlineError("");
    setIsPending(true);
    try {
      const payload: Record<string, any> = {
        first_name: data.firstName,
        last_name: data.lastName,
        role_slugs: [data.role],
        locale: data.locale,
      };
      if (data.email) payload.email = data.email;
      if (data.phoneNumber) payload.phone_number = data.phoneNumber;
      if (isSuperAdmin && data.orgId) payload.org_id = data.orgId;

      const res = await axiosInstance.post("/users/invite", payload);
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_USERS });

      setSuccess({
        firstName: data.firstName,
        lastName: data.lastName,
        expiresAt: res.data?.expires_at,
      });
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      if (code === "PHONE_ALREADY_REGISTERED") setInlineError("This phone number is already registered to another account.");
      else if (code === "EMAIL_ALREADY_REGISTERED") setInlineError("This email is already registered to another account.");
      else showToast(err.message || "Failed to send invitation.", "error");
    } finally {
      setIsPending(false);
    }
  };

  const handleInviteAnother = () => {
    setSuccess(null);
    setInlineError("");
    reset({ firstName: "", lastName: "", email: "", phoneNumber: "", role: roles[0]?.slug ?? "", locale: "rw", orgId: companyId });
  };

  // Success modal
  if (success) {
    return (
      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-neutral-900 dark:text-white">Invitation sent!</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {success.firstName} {success.lastName} has been invited.
          </p>
          {success.expiresAt && (
            <p className="text-xs text-neutral-400 mt-1">
              Expires: {new Date(success.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={handleInviteAnother}
            className="flex-1 border border-brand text-brand py-2 rounded-lg text-sm font-medium hover:bg-brand/5 transition-colors">
            Invite Another
          </button>
          <button onClick={() => setSuccess(null)}
            className="flex-1 bg-brand text-white py-2 rounded-lg text-sm font-medium hover:brightness-95 transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-sm">

        {/* Role selector */}
        <div>
          <label className={labelClass}>Role <span className="text-red-500">*</span></label>
          <select {...register("role")} className={inputClass}>
            {roles.map((r) => (
              <option key={r.slug} value={r.slug}>{camelCaseToTitle(r.slug)}</option>
            ))}
          </select>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
        </div>

        {/* Permissions preview */}
        {selectedRoleSlug && (
          <div className="rounded-md bg-gray-50 dark:bg-neutral-800 p-3 text-xs">
            <p className="font-semibold mb-2 dark:text-white">Permissions for {camelCaseToTitle(selectedRoleSlug)}:</p>
            {grantsLoading ? (
              <div className="flex items-center gap-2 text-neutral-400">
                <div className="animate-spin rounded-full h-3 w-3 border border-brand border-t-transparent" />
                Loading...
              </div>
            ) : grants.length === 0 ? (
              <p className="text-neutral-400">No permissions assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {grants.map((grant) => (
                  <div key={grant.pattern} className="rounded-md border border-brand/20 bg-brand/5 px-3 py-1.5 flex flex-col">
                    <div className="flex items-center text-brand font-medium">
                      {grant.displayName}
                      <div className="ml-1.5 opacity-70 flex items-center">
                        {grant.scope === "org" && <BsBuilding title="Organization Scope" />}
                        {grant.scope === "platform" && <BiWorld title="Platform Scope" />}
                        {grant.scope === "own" && <BiUser title="Self Scope" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-brand/70 mt-0.5 truncate max-w-[220px]" title={grant.description}>
                      {grant.description}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Name */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
            <input {...register("firstName")} type="text" className={inputClass} />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
            <input {...register("lastName")} type="text" className={inputClass} />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>Phone Number</label>
          <input {...register("phoneNumber")} type="tel" placeholder="+250788000001" className={inputClass} />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email</label>
          <input {...register("email")} type="email" className={inputClass} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <p className="text-xs text-neutral-400">At least one of phone or email is required.</p>

        {/* Locale */}
        <div>
          <label className={labelClass}>Language</label>
          <select {...register("locale")} className={inputClass}>
            {LOCALES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Org selector — platform-admin only */}
        {isSuperAdmin && (
          <div>
            <label className={labelClass}>Organization</label>
            <select {...register("orgId")} className={inputClass}>
              {allOrgs.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        )}

        {inlineError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg border border-red-100 dark:border-red-800">
            {inlineError}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !isValid}
          className="bg-brand p-2 w-full text-white rounded-sm cursor-pointer hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Sending invitation..." : "Send Invitation"}
        </button>
      </form>
    </div>
  );
};

export default AddAgent;
