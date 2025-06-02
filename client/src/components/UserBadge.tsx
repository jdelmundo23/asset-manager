import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./shadcn-ui/dropdown-menu";
import { Link } from "react-router";
import { buttonVariants } from "./shadcn-ui/button";
import { cn } from "@/lib/utils";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";

const serverUrl = import.meta.env.VITE_BACKEND_URL;

interface UserBadgeProps {
  authenticated: boolean;
  name: string | undefined;
  className?: string;
}

const logOut = async () => {
  try {
    const response = await axiosApi.get(`/health`, {
      timeout: 5000,
    });

    if (response.status === 200 && response.data.status === "ok") {
      window.location.href = `${serverUrl}/auth/signout`;
    }
  } catch (error) {
    handleError(error);
  }
};

export default function UserBadge({
  authenticated,
  name,
  className,
}: UserBadgeProps) {
  return authenticated ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "secondary" }), className)}
      >
        {name ?? "N/A"}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenuItem onSelect={logOut}>
          <LogOut />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Link to="/signin" className={buttonVariants({ variant: "default" })}>
      Sign In
    </Link>
  );
}
