import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const withAuth = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.replace("/sign-in");
      }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <span>Loading...</span>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
