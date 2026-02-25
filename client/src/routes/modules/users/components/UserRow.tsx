import { Card } from "@/components/shadcn-ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip";
import { User } from "@shared/schemas";
import { AlertTriangle, Info, MonitorSmartphone } from "lucide-react";
import DeleteUser from "./DeleteUser";
import UserView from "./UserView";
import AdminAction from "@/components/AdminAction";

export default function UserRow({ user }: { user: User }) {
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
          <div className="flex w-5/6 max-w-[200px] flex-col lg:max-w-[300px]">
            {user.name}
            <p className="text-xs font-normal opacity-60">{user.email}</p>
          </div>
          <div className="flex items-center gap-x-1.5">
            <div className="flex items-center gap-x-1.5 opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100">
              <AdminAction hide>
                {!user.active ? <DeleteUser user={user} /> : <></>}
              </AdminAction>
              <UserAssets user={user} />
            </div>
            <UserInfo user={user} datetime={datetime} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function UserAssets({ user }: { user: User }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <UserView user={user}>
            <MonitorSmartphone className="h-5 w-5" />
          </UserView>
        </TooltipTrigger>
        <TooltipContent className="border-muted-background border">
          <p>View Assets</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function UserInfo({ user, datetime }: { user: User; datetime: string }) {
  return (
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
  );
}
