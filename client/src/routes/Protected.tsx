import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
function Protected() {
  const { authenticated } = useAuth();

  return authenticated ? <Outlet /> : <Navigate to="/signin" />;
}

export default Protected;
