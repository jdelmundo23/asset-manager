import { useContext } from "react";
import { Link } from "react-router";
import AuthContext from "../../../context/AuthContext";
import { buttonVariants } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { LogOut } from "lucide-react";

interface HeaderProps {
  sidebarActive: boolean;
}
const Header = ({ sidebarActive }: HeaderProps) => {
  const user = useContext(AuthContext);
  return (
    <div className="flex h-14 w-full items-center justify-between px-3">
      <div className="flex">
        <div
          className={`${sidebarActive ? "" : "md:w-9"} w-9 transition-[width] duration-500 ease-in-out md:w-0`}
        ></div>
        <Link to="/" className="flex h-full items-center">
          Logo
        </Link>
      </div>

      {user.authenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({ variant: "secondary" })}
          >
            {user.name}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dark">
            <DropdownMenuItem
              onSelect={() => {
                window.location.href = "http://localhost:5000/auth/signout";
              }}
            >
              <LogOut />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link to="/signin" className={buttonVariants({ variant: "default" })}>
          Sign In
        </Link>
      )}
    </div>
  );
};

export default Header;
