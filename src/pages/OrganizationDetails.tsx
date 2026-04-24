import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useOrganizationById,
  useUpdateOrganization,
  useCooperativeApprove,
  useCooperativeReject,
  getOrgLogoPresignedUrl,
  Organization,
} from "../hooks/useOrganizations";
import { useAbility } from "../contexts/AbilityContext";
import { useToastStore } from "../stores/toastStore";
import useUser from "../hooks/useUser";
import { buildCdnUrl } from "../services/apiClient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: Organization["status"]) {
  const map: Record<Organization["status"], string> = {
    unverified: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    suspended: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

function typeBadge(type: Organization["org_type"]) {
  const map: Record<Organization["org_type"], string> = {
    company: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    cooperative: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    coop_member: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  };
  const labels: Record<Organization["org_type"], string> = {
    company: "Company",
    cooperative: "Cooperative",
    coop_member: "Coop Member",
  };
  return { cls: map[type], label: labels[type] };
}

function VerifiedBadge({ verifiedAt }: { verifiedAt?: string | null }) {
  if (verifiedAt) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
      Unverified
    </span>
  );
}

const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors disabled:bg-gray-50 dark:disabled:bg-neutral-800 disabled:text-neutral-500";
const labelClass = "block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1";
const sectionClass = "bg-white dark:bg-neutral-950/90 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 mb-4";

// ─── Reject dialog ────────────────────────────────────────────────────────────

function RejectDialog({
  title,
  reasonRequired,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  reasonRequired: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 w-full max-w-md z-[60]">
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          {reasonRequired ? "A rejection reason is required." : "Optionally provide a reason for the applicant."}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Enter reason..."
          className={inputClass}
        />
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending || (reasonRequired && !reason.trim())}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 w-full max-w-md z-[60]">
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${confirmClass ?? "bg-brand text-white hover:brightness-95"}`}
          >
            {isPending ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const OrganizationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ability = useAbility();
  const showToast = useToastStore((s) => s.showToast);
  const { user } = useUser();

  const { data: org, isLoading, error } = useOrganizationById(id!);
  const updateOrg = useUpdateOrganization();
  const coopApprove = useCooperativeApprove();
  const coopReject = useCooperativeReject();

  // Edit state
  const [editFields, setEditFields] = useState<Partial<Organization>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [inlineError, setInlineError] = useState("");

  // Dialog state
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showCoopRejectDialog, setShowCoopRejectDialog] = useState(false);

  // Logo upload
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const isPlatformAdmin = ability.can("manage", "all");
  const callerOrgId = user && "org_id" in user ? (user as any).org_id : null;

  // Is this caller a cooperative org-admin whose org is the parent of this coop_member?
  const isParentCoopAdmin =
    !isPlatformAdmin &&
    org?.org_type === "coop_member" &&
    org?.parent_org_id &&
    callerOrgId === org.parent_org_id &&
    ability.can("approve", "Org");

  const isReadOnly = org?.status === "active" || org?.status === "rejected";

  const hasChanges = org && Object.keys(editFields).some(
    (k) => (editFields as any)[k] !== (org as any)[k]
  );

  const startEdit = () => {
    if (org) setEditFields({ ...org });
    setIsEditing(true);
    setInlineError("");
  };

  const cancelEdit = () => {
    setEditFields({});
    setIsEditing(false);
    setInlineError("");
  };

  const set = (field: keyof Organization, value: string | null) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!id || !org) return;
    setInlineError("");

    const payload: any = {};
    const editableFields: (keyof Organization)[] = isPlatformAdmin
      ? ["name", "contact_first_name", "contact_last_name", "contact_email", "contact_phone", "address", "tin", "license_number"]
      : ["contact_first_name", "contact_last_name", "contact_email", "contact_phone", "address"];

    editableFields.forEach((f) => {
      if ((editFields as any)[f] !== (org as any)[f]) {
        payload[f] = (editFields as any)[f];
      }
    });

    if (Object.keys(payload).length === 0) return;

    updateOrg.mutate({ id, data: payload }, {
      onSuccess: () => {
        showToast("Organization updated", "success");
        setIsEditing(false);
        setEditFields({});
      },
      onError: (err: any) => {
        const code = err?.response?.data?.error?.code;
        if (code === "ORG_ALREADY_EXISTS") setInlineError("An organization with this name already exists.");
        else if (code === "CONTACT_PHONE_ALREADY_REGISTERED") setInlineError("This contact phone is already registered.");
        else if (code === "CONTACT_EMAIL_ALREADY_REGISTERED") setInlineError("This contact email is already registered.");
        else setInlineError(err?.response?.data?.error?.message || "Failed to save changes.");
      },
    });
  };

  const handleApprove = () => {
    if (!id) return;
    updateOrg.mutate({ id, data: { status: "active" } }, {
      onSuccess: () => showToast("Organization approved", "success"),
      onError: (err: any) => {
        const code = err?.response?.data?.error?.code;
        if (code === "COOPERATIVE_APPROVAL_REQUIRED") showToast("This member org must be pre-approved by the cooperative first", "error");
        else showToast(err?.response?.data?.error?.message || "Failed to approve", "error");
      },
    });
  };

  const handleReject = (reason: string) => {
    if (!id) return;
    updateOrg.mutate({ id, data: { status: "rejected", rejection_reason: reason } }, {
      onSuccess: () => { showToast("Organization rejected", "success"); setShowRejectDialog(false); },
      onError: (err: any) => { showToast(err?.response?.data?.error?.message || "Failed to reject", "error"); },
    });
  };

  const handleSuspend = () => {
    if (!id) return;
    updateOrg.mutate({ id, data: { status: "suspended" } }, {
      onSuccess: () => { showToast("Organization suspended", "success"); setShowSuspendDialog(false); },
      onError: (err: any) => { showToast(err?.response?.data?.error?.message || "Failed to suspend", "error"); },
    });
  };

  const handleCoopApprove = () => {
    if (!id) return;
    coopApprove.mutate(id, {
      onError: (err: any) => { showToast(err?.response?.data?.error?.message || "Failed to pre-approve", "error"); },
    });
  };

  const handleCoopReject = (reason: string) => {
    if (!id) return;
    coopReject.mutate({ id, reason: reason || undefined }, {
      onSuccess: () => setShowCoopRejectDialog(false),
      onError: (err: any) => { showToast(err?.response?.data?.error?.message || "Failed to reject", "error"); },
    });
  };

  const handleLogoUpload = async (file: File) => {
    if (!id) return;
    setLogoUploading(true);
    try {
      const presigned = await getOrgLogoPresignedUrl(file.type, isPlatformAdmin ? id : undefined);
      await fetch(presigned.upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      updateOrg.mutate({ id, data: { logo_path: presigned.path } }, {
        onSuccess: () => showToast("Logo updated", "success"),
        onError: () => showToast("Failed to save logo", "error"),
      });
    } catch {
      showToast("Failed to upload logo", "error");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    if (!id) return;
    updateOrg.mutate({ id, data: { logo_path: null } }, {
      onSuccess: () => showToast("Logo removed", "success"),
      onError: () => showToast("Failed to remove logo", "error"),
    });
  };

  // ─── Loading / error states ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-neutral-600 dark:text-neutral-400">Organization not found.</p>
        <button onClick={() => navigate("/organizations")} className="text-brand hover:underline text-sm">
          Back to Organizations
        </button>
      </div>
    );
  }

  const typeBadgeInfo = typeBadge(org.org_type);
  const val = (field: keyof Organization) => isEditing ? ((editFields as any)[field] ?? "") : ((org as any)[field] ?? "");
  const coopApproveDisabled = org.org_type === "coop_member" && !org.cooperative_approved_at;

  return (
    <div className="px-4 py-6 min-h-screen max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate("/organizations")} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-brand mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Organizations
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-bold text-2xl text-neutral-900 dark:text-white">{org.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${typeBadgeInfo.cls}`}>{typeBadgeInfo.label}</span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusBadge(org.status)}`}>{org.status}</span>
              {org.org_type === "coop_member" && (
                org.cooperative_approved_at
                  ? <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Coop Approved</span>
                  : <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Awaiting Cooperative Approval</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {isReadOnly ? (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 italic self-center">
                {org.status === "active" ? "Organization is active — read only" : "Organization is rejected — read only"}
              </span>
            ) : (
              <>
                {/* Platform-admin actions */}
                {isPlatformAdmin && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={updateOrg.isPending || coopApproveDisabled}
                      title={coopApproveDisabled ? "Cooperative approval required first" : undefined}
                      className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {updateOrg.isPending ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => setShowRejectDialog(true)}
                      disabled={updateOrg.isPending}
                      className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setShowSuspendDialog(true)}
                      disabled={updateOrg.isPending}
                      className="px-4 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 disabled:opacity-50 transition-colors"
                    >
                      Suspend
                    </button>
                  </>
                )}

                {/* Cooperative org-admin actions */}
                {isParentCoopAdmin && !org.cooperative_approved_at && (
                  <>
                    <button
                      onClick={handleCoopApprove}
                      disabled={coopApprove.isPending}
                      className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
                    >
                      {coopApprove.isPending ? "..." : "Pre-Approve"}
                    </button>
                    <button
                      onClick={() => setShowCoopRejectDialog(true)}
                      disabled={coopApprove.isPending}
                      className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                    >
                      Reject as Cooperative
                    </button>
                  </>
                )}

                {/* Edit / Save */}
                {!isEditing ? (
                  <button onClick={startEdit} className="px-4 py-2 text-sm font-medium text-brand border border-brand rounded-lg hover:bg-brand/5 transition-colors">
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || updateOrg.isPending}
                      className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
                    >
                      {updateOrg.isPending ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={cancelEdit} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Inline error */}
      {inlineError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {inlineError}
        </div>
      )}

      {/* Logo */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">Logo</h2>
        <div className="flex items-center gap-4">
          {org.logo_path ? (
            <img src={buildCdnUrl(org.logo_path)} alt={org.name} className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-neutral-700" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 text-xs">No logo</div>
          )}
          <div className="flex flex-col gap-2">
            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="px-3 py-1.5 text-xs font-medium text-brand border border-brand rounded-lg hover:bg-brand/5 disabled:opacity-50 transition-colors"
            >
              {logoUploading ? "Uploading..." : org.logo_path ? "Change Logo" : "Upload Logo"}
            </button>
            {org.logo_path && (
              <button onClick={handleRemoveLogo} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Remove Logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Org Details */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">Organization Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" value={val("name")} onChange={(e) => set("name", e.target.value)} disabled={!isEditing || !isPlatformAdmin} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input type="text" value={org.slug} disabled className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>TIN</label>
            <input type="text" value={val("tin")} onChange={(e) => set("tin", e.target.value)} disabled={!isEditing || !isPlatformAdmin} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>License Number</label>
            <input type="text" value={val("license_number")} onChange={(e) => set("license_number", e.target.value)} disabled={!isEditing || !isPlatformAdmin} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <textarea value={val("address")} onChange={(e) => set("address", e.target.value)} disabled={!isEditing} rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Created</label>
            <input type="text" value={new Date(org.created_at).toLocaleString()} disabled className={inputClass} />
          </div>
          {org.updated_at && (
            <div>
              <label className={labelClass}>Last Updated</label>
              <input type="text" value={new Date(org.updated_at).toLocaleString()} disabled className={inputClass} />
            </div>
          )}
        </div>
      </div>

      {/* Contact Details */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">Contact Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name</label>
            <input type="text" value={val("contact_first_name")} onChange={(e) => set("contact_first_name", e.target.value)} disabled={!isEditing} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input type="text" value={val("contact_last_name")} onChange={(e) => set("contact_last_name", e.target.value)} disabled={!isEditing} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <div className="flex items-center gap-2">
              <input type="email" value={val("contact_email")} onChange={(e) => set("contact_email", e.target.value)} disabled={!isEditing} className={inputClass} />
              <VerifiedBadge verifiedAt={org.contact_email_verified_at} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <div className="flex items-center gap-2">
              <input type="tel" value={val("contact_phone")} onChange={(e) => set("contact_phone", e.target.value)} disabled={!isEditing} className={inputClass} />
              <VerifiedBadge verifiedAt={org.contact_phone_verified_at} />
            </div>
          </div>
        </div>
      </div>

      {/* Documents (for pending/unverified orgs) */}
      {(org.business_certificate_path || org.rep_id_path) && (
        <div className={sectionClass}>
          <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">Documents</h2>
          <div className="flex flex-col gap-3">
            {org.business_certificate_path && (
              <a
                href={buildCdnUrl(org.business_certificate_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:border-brand hover:bg-brand/5 transition-colors group"
              >
                <svg className="w-8 h-8 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-brand">Business Certificate</p>
                  <p className="text-xs text-neutral-500">Click to view or download</p>
                </div>
                <svg className="w-4 h-4 text-neutral-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {org.rep_id_path && (
              <a
                href={buildCdnUrl(org.rep_id_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:border-brand hover:bg-brand/5 transition-colors group"
              >
                <svg className="w-8 h-8 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-brand">Representative ID</p>
                  <p className="text-xs text-neutral-500">Click to view or download</p>
                </div>
                <svg className="w-4 h-4 text-neutral-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Parent org (coop_member) */}
      {org.org_type === "coop_member" && (
        <div className={sectionClass}>
          <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">Parent Cooperative</h2>
          {org.parent_org ? (
            <Link to={`/organizations/${org.parent_org.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:border-brand hover:bg-brand/5 transition-colors group">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-brand">{org.parent_org.name}</p>
                <p className="text-xs text-neutral-500 font-mono">@{org.parent_org.slug}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusBadge(org.parent_org.status as Organization["status"])}`}>{org.parent_org.status}</span>
            </Link>
          ) : (
            <p className="text-sm text-neutral-500">Parent org ID: {org.parent_org_id}</p>
          )}
          {org.cooperative_approved_at && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Pre-approved by cooperative on {new Date(org.cooperative_approved_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Child orgs (cooperative, platform-admin only) */}
      {isPlatformAdmin && org.org_type === "cooperative" && org.child_orgs && org.child_orgs.length > 0 && (
        <div className={sectionClass}>
          <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">Member Organizations ({org.child_orgs.length})</h2>
          <div className="space-y-2">
            {org.child_orgs.map((child) => (
              <Link key={child.id} to={`/organizations/${child.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:border-brand hover:bg-brand/5 transition-colors group">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-brand">{child.name}</p>
                  <p className="text-xs text-neutral-500 font-mono">@{child.slug}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusBadge(child.status as Organization["status"])}`}>{child.status}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Admin-only metadata */}
      {isPlatformAdmin && (org.approved_at || org.approved_by || org.cooperative_approved_by) && (
        <div className={sectionClass}>
          <h2 className="font-semibold text-base text-neutral-900 dark:text-white mb-4">Approval History</h2>
          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            {org.cooperative_approved_at && (
              <p>Cooperative pre-approved: <span className="text-neutral-900 dark:text-white">{new Date(org.cooperative_approved_at).toLocaleString()}</span></p>
            )}
            {org.cooperative_approved_by && (
              <p>Pre-approved by: <span className="text-neutral-900 dark:text-white font-mono text-xs">{org.cooperative_approved_by}</span></p>
            )}
            {org.approved_at && (
              <p>Final approval: <span className="text-neutral-900 dark:text-white">{new Date(org.approved_at).toLocaleString()}</span></p>
            )}
            {org.approved_by && (
              <p>Approved by: <span className="text-neutral-900 dark:text-white font-mono text-xs">{org.approved_by}</span></p>
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {showRejectDialog && (
        <RejectDialog
          title="Reject Organization"
          reasonRequired={true}
          onConfirm={handleReject}
          onCancel={() => setShowRejectDialog(false)}
          isPending={updateOrg.isPending}
        />
      )}

      {showSuspendDialog && (
        <ConfirmDialog
          title="Suspend Organization"
          message="This will suspend the organization and immediately invalidate all active tokens for its users. Are you sure?"
          confirmLabel="Suspend"
          confirmClass="bg-orange-600 text-white hover:bg-orange-700"
          onConfirm={handleSuspend}
          onCancel={() => setShowSuspendDialog(false)}
          isPending={updateOrg.isPending}
        />
      )}

      {showCoopRejectDialog && (
        <RejectDialog
          title="Reject as Cooperative"
          reasonRequired={false}
          onConfirm={handleCoopReject}
          onCancel={() => setShowCoopRejectDialog(false)}
          isPending={coopReject.isPending}
        />
      )}
    </div>
  );
};

export default OrganizationDetails;
