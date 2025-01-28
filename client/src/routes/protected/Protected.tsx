import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import AuthContext from "../../context/AuthContext";
function Protected() {
  const { authenticated } = useContext(AuthContext);

  return authenticated ? <Outlet /> : <Navigate to="/signin" />;
}

export default Protected;
