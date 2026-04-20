import { createContext, ReactNode, useContext, useMemo } from "react";
import {
  Ability,
  AbilityBuilder,
  MongoAbility,
  createMongoAbility,
} from "@casl/ability";
import { unpackRules } from "@casl/ability/extra";
import { createContextualCan } from "@casl/react";

// ─── Subjects aligned with the IAM spec ──────────────────────────────────────
// The JWT packs rules using these exact subject names.
// "all" is CASL's built-in wildcard (used by platform-admin: can('manage','all'))
export type Actions =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "invite"
  | "suspend"
  | "assign_role"
  | "approve"
  | "upload"
  | "export";

export type Subjects =
  | "User"
  | "Org"
  | "Organization"   // alias kept for legacy AuthGuard calls
  | "Role"
  | "Invitation"
  | "MediaAsset"
  | "OrgDocument"
  | "AuditLog"
  // legacy subjects used in existing AuthGuard / Can usages
  | "Bus"
  | "Driver"
  | "Trip"
  | "Ticket"
  | "Report"
  | "Home"
  | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

// ─── CaslRule — shape of a packed rule from the JWT ──────────────────────────
export interface CaslRule {
  action: string;
  subject: string;
  conditions?: Record<string, unknown> | null;
  inverted?: boolean;
}

/**
 * Build ability from packed CASL rules (JWT format).
 *
 * The JWT payload contains a `permissions` array of packed rules produced by
 * `packRules()` on the server. We reconstruct them with `unpackRules()`.
 *
 * Fallback: if the array contains plain `{ action, subject }` objects (legacy
 * mock format), we build the ability directly from those.
 */
export function buildAbility(rules: CaslRule[] = []): AppAbility {
  if (!rules || rules.length === 0) return createMongoAbility<[Actions, Subjects]>([]);

  // Detect packed format: packed rules are arrays, not objects
  const isPacked = Array.isArray(rules[0]);
  if (isPacked) {
    try {
      const unpacked = unpackRules(rules as any);
      return createMongoAbility<[Actions, Subjects]>(unpacked as any);
    } catch {
      // fall through to legacy path
    }
  }

  // Legacy / mock format: plain { action, subject, conditions? } objects
  const { can, build } = new AbilityBuilder<AppAbility>(Ability);
  rules.forEach((rule: any) => {
    const action = rule.action as Actions;
    const subject = rule.subject as Subjects;
    if (rule.inverted) return; // skip inverted rules in legacy path
    if (rule.conditions) {
      can(action, subject, rule.conditions as any);
    } else {
      can(action, subject);
    }
  });
  return build();
}

export const AbilityContext = createContext<AppAbility>(buildAbility([]));
export const Can = createContextualCan(AbilityContext.Consumer);

interface AbilityProviderProps {
  children: ReactNode;
  permissions: CaslRule[];
}

export function AbilityProvider({ children, permissions }: AbilityProviderProps) {
  const ability = useMemo(() => buildAbility(permissions), [permissions]);
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  return useContext(AbilityContext);
}
