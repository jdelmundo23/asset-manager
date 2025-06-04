import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Navigate } from "react-router";
import { Card } from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { LoaderCircle } from "lucide-react";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";

const serverUrl = import.meta.env.VITE_BACKEND_URL;

function Signin() {
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const { authenticated } = useContext(AuthContext);

  useEffect(() => {
    setRedirecting(false);
  }, []);

  const signIn = async () => {
    setRedirecting(true);
    try {
      const response = await axiosApi.get(`/health`, {
        timeout: 5000,
      });

      if (response.status === 200 && response.data.status === "ok") {
        window.location.href = `${serverUrl}/auth/signin`;
      }
    } catch (error) {
      handleError(error);
      setRedirecting(false);
    }
  };

  if (authenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="bg-muted-background flex h-full w-full items-center justify-center">
      <Card className="bg-muted animate-fade-in-up flex h-[125px] flex-col items-center justify-between p-4">
        <h1 className="text-2xl font-semibold">Asset and Network Tracker</h1>
        <Button
          className="w-full gap-x-1"
          onClick={signIn}
          disabled={redirecting}
        >
          {redirecting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Sign in with Microsoft"
          )}
        </Button>
      </Card>
    </div>
  );
}

export default Signin;
