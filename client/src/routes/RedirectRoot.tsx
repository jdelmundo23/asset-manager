import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router";

export default function RedirectRoot() {
  const { authenticated } = useAuth();
  return authenticated ? (
    <Navigate to={"/app"} replace />
  ) : (
    <Navigate to={"/signin"} replace />
  );
}
