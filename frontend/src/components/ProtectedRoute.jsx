import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  if (auth.isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
      </div>
    );
  }
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
