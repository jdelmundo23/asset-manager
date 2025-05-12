import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Navigate } from "react-router";
import { Card } from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import axios from "axios";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

function Signin() {
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const { authenticated } = useContext(AuthContext);

  const signIn = async () => {
    setRedirecting(true);
    try {
      const response = await axios.get("http://localhost:5000/health", {
        timeout: 5000,
      });

      if (response.status === 200 && response.data.status === "ok") {
        window.location.href = "http://localhost:5000/auth/signin";
      } else {
        toast.error("Server responded unexpectedly. Please try again later.");
        setRedirecting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to reach the server. Please try again later.");
      setRedirecting(false);
    }
  };

  if (authenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="bg-muted-background dark flex h-full w-full items-center justify-center">
      <Card className="bg-muted animate-fade-in-up dark flex h-[125px] flex-col items-center justify-between p-4">
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
