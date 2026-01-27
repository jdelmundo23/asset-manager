import { Card } from "@/components/shadcn-ui/card";
import { LoaderCircle } from "lucide-react";

function Signout() {
  return (
    <div className="bg-muted-background flex h-full w-full items-center justify-center">
      <Card className="bg-muted animate-fade-in-up flex h-[125px] flex-col items-center justify-center gap-y-2 border-2 p-4">
        <h1 className="text-2xl">You have been signed out of the app</h1>
        <LoaderCircle className="animate-spin" />
        <h2>Redirecting to sign in</h2>
      </Card>
    </div>
  );
}
export default Signout;
