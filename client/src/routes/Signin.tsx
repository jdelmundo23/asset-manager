import { useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { Navigate } from "react-router";
import { Card } from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";

const signIn = () => {
  window.location.href = "http://localhost:5000/auth/signin";
};

function Signin() {
  useEffect(() => {}, []);

  const { authenticated } = useContext(AuthContext);

  if (authenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="bg-muted-background dark flex h-full w-full items-center justify-center">
      <Card className="bg-muted animate-fade-in-up dark flex h-[125px] flex-col items-center justify-between p-4">
        <h1 className="text-2xl font-semibold">Asset and Network Tracker</h1>
        <Button className="w-full" onClick={signIn}>
          Sign in with Microsoft
        </Button>
      </Card>
    </div>
  );
}

export default Signin;
