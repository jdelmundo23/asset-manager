import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router";

export default function RedirectRoot() {
  const { authenticated, loading } = useAuth();

  if (loading) return null;

  return authenticated ? (
    <Navigate to={"/app"} replace />
  ) : (
    <Navigate to={"/signin"} replace />
  );
}
