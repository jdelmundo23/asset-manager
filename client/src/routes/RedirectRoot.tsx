import AuthContext from "@/context/AuthContext";
import { useContext } from "react";
import { Navigate } from "react-router";

export default function RedirectRoot() {
  const { authenticated } = useContext(AuthContext);
  return authenticated ? (
    <Navigate to={"/app"} replace />
  ) : (
    <Navigate to={"/signin"} replace />
  );
}
