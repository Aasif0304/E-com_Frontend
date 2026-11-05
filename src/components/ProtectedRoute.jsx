import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// <ProtectedRoute /> = must be logged in, <ProtectedRoute adminOnly /> = must be ADMIN
export default function ProtectedRoute({ adminOnly = false }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
