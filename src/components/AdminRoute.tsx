import { Navigate } from "react-router-dom";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default AdminRoute;
