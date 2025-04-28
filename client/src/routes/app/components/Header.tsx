import { useContext } from "react";
import { Link } from "react-router";
import AuthContext from "../../../context/AuthContext";
import UserBadge from "@/components/UserBadge";

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
      <UserBadge
        authenticated={user.authenticated}
        name={user.name}
        className="hidden md:inline-block"
      />
    </div>
  );
};

export default Header;
