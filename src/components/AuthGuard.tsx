import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAbility } from "../contexts/AbilityContext";
import useUser from "../hooks/useUser";
import { useToastStore } from "../stores/toastStore";
import Skeleton from "../pages/Skeleton";

interface AuthGuardProps {
  children: ReactNode;
  action: string;
  subject: string;
  fallback?: ReactNode;
}

const AuthGuard = ({ children, action, subject, fallback }: AuthGuardProps) => {
  const ability = useAbility();
  const { user, loading } = useUser();
  const showToast = useToastStore((state) => state.showToast);

  if (loading) {
    return <Skeleton/>; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!ability.can(action as any, subject as any)) {
    showToast("Permission denied", "error");
    return fallback || <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
