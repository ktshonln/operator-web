import { createContext, ReactNode, useContext, useMemo } from "react";
import { Ability, AbilityBuilder, MongoAbility } from "@casl/ability";
import { createContextualCan } from "@casl/react";

export type Actions =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "approve";
export type Subjects =
  | "User"
  | "Organization"
  | "Bus"
  | "Driver"
  | "Trip"
  | "Ticket"
  | "Report"
  | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

interface Permission {
  action: Actions;
  subject: Subjects;
}

export function buildAbility(permissions: Permission[] = []): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(Ability);

  permissions.forEach(({ action, subject }) => {
    can(action, subject);
  });

  return build();
}

export const AbilityContext = createContext<AppAbility>(buildAbility([]));
export const Can = createContextualCan(AbilityContext.Consumer);

interface AbilityProviderProps {
  children: ReactNode;
  permissions: Permission[];
}

export function AbilityProvider({
  children,
  permissions,
}: AbilityProviderProps) {
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
