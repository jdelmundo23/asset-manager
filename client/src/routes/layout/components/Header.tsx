import { useContext } from "react";
import { Link } from "react-router";
import AuthContext from "../../../context/AuthContext";
import { Button } from "@/components/shadcn-ui/button";

interface HeaderProps {
  sidebarActive: boolean;
}
const Header = ({ sidebarActive }: HeaderProps) => {
  const user = useContext(AuthContext);
  return (
    <div className="flex h-14 w-full items-center justify-between px-3">
      <div className="flex">
        <div
          className={`${sidebarActive ? "w-0" : "w-9"} transition-[width] duration-500 ease-in-out`}
        ></div>
        <Link to="/" className="flex h-full items-center">
          Logo
        </Link>
      </div>
      <Button>
        {user.authenticated ? (
          <button
            onClick={() => {
              window.location.href = "http://localhost:5000/auth/signout";
            }}
            className="flex h-full items-center"
          >
            {user.name}
          </button>
        ) : (
          <Link to="/signin" className="flex h-full items-center">
            Sign In
          </Link>
        )}
      </Button>
    </div>
  );
};

export default Header;
