import { useAbility } from "@casl/react";
import { ReactNode } from "react";

interface CanProps {
  I: string; // action
  a: string; // subject
  children?: ReactNode;
}

export const Can = ({ I, a, children }: CanProps) => {
  const ability = useAbility();

  const can = ability.can(I, a);

  return can ? <>{children}</> : null;
};

export default Can;
