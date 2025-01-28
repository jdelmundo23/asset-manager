import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Navigate } from "react-router";
function Signin() {
  const { authenticated } = useContext(AuthContext);
  const signIn = () => {
    window.location.href = "http://localhost:5000/auth/signin";
  };

  if (authenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="h-[100px] w-[300px] rounded-md border border-white">
      <button onClick={signIn} className={`text-blue-600`}>
        Sign in
      </button>
    </div>
  );
}

export default Signin;
