import { useAbility } from "../contexts/AbilityContext";
import { ReactNode } from "react";
import type { Actions, Subjects } from "../contexts/AbilityContext";

interface CanProps {
  I: Actions; // action
  a: Subjects; // subject
  children?: ReactNode;
}

export const Can = ({ I, a, children }: CanProps) => {
  const ability = useAbility();

  const can = ability.can(I, a);

  return can ? <>{children}</> : null;
};

export default Can;
