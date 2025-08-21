import { Card } from "@/components/shadcn-ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip";
import { User } from "@shared/schemas";
import { AlertTriangle, Info } from "lucide-react";
import DeleteUser from "./DeleteUser";

interface UserRowProps {
  user: User;
}

export default function UserRow({ user }: UserRowProps) {
  const date = new Date(user.last_sync);
  const datetime = new Intl.DateTimeFormat("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
  return (
    <div>
      <Card
        className={`bg-muted border-muted-foreground/25 text-foreground group rounded-md px-2 py-1 ${user.active}`}
      >
        <div className="flex items-center justify-between">
          <p
            title={user.name}
            className="w-5/6 max-w-[200px] truncate lg:max-w-[300px]"
          >
            {user.name}
          </p>
          <div className="flex items-center gap-x-1.5">
            {/* <Badge className="h-5 cursor-pointer text-nowrap font-medium opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100">
              View Assets
            </Badge> */}
            {!user.active && <DeleteUser user={user} />}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {user.active ? (
                    <Info className="h-5 w-5 opacity-50" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  )}
                </TooltipTrigger>
                <TooltipContent className="border-muted-background border">
                  <p>
                    <span className="font-bold">Status:</span>{" "}
                    {user.active ? "Active" : "Inactive"}
                  </p>
                  <p>
                    <span className="font-bold">Last synced: </span>
                    {datetime}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>
    </div>
  );
}
