import { useAuthContext } from "@/context/AuthProvider";

export const useAuth = () => {
  const { user, loading } = useAuthContext();
  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
};
