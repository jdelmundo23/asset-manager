import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Navigate } from "react-router";
import { Card } from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
function Signin() {
  const { authenticated } = useContext(AuthContext);

  const signIn = () => {
    window.location.href = "http://localhost:5000/auth/signin";
  };

  if (authenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="dark flex h-[125px] flex-col items-center justify-between p-4">
        <h1 className="text-2xl font-semibold">Asset and Network Tracker</h1>
        <Button className="w-full" onClick={signIn}>
          Sign in with Microsoft
        </Button>
      </Card>
    </div>
  );
}

export default Signin;
