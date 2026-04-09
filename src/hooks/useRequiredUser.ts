import useUser, { StaffUser } from "./useUser";

export const useRequiredUser = () => {
  const { user, loading } = useUser();

  // If we are still loading, don't throw an error yet
  if (loading) return null as unknown as StaffUser; 

  if (!user) {
    throw new Error("useRequiredUser must be used within an AuthGuard");
  }
  return user as StaffUser;
};

