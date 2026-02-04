import { useAuth } from "@/context/AuthContext";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./shadcn-ui/tooltip";

type AdminActionProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactElement;
  hide?: boolean;
};

const AdminAction = React.forwardRef<HTMLElement, AdminActionProps>(
  ({ children, hide, ...props }, ref) => {
    const { isAdmin: can } = useAuth();

    if (hide) {
      if (can) return <>{children}</>;
      return <></>;
    } else {
      return (
        <TooltipProvider disableHoverableContent={false}>
          <Tooltip>
            <TooltipTrigger
              asChild
              className={`${can ? "" : "cursor-not-allowed"}`}
            >
              {React.cloneElement(children, {
                ref,
                ...props,
                ...(!can
                  ? {
                      onClick: (e: React.PointerEvent<HTMLElement>) => {
                        e.preventDefault();
                        e.stopPropagation();
                      },
                      disabled: true,
                    }
                  : {}),
              })}
            </TooltipTrigger>
            {!can ? (
              <TooltipContent
                className="bg-muted text-foreground pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                Admin role required
              </TooltipContent>
            ) : (
              ""
            )}
          </Tooltip>
        </TooltipProvider>
      );
    }
  }
);

AdminAction.displayName = "AdminAction";

export default AdminAction;
