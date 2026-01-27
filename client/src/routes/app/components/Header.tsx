import { Link } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import UserBadge from "@/components/UserBadge";

interface HeaderProps {
  sidebarActive: boolean;
}
const Header = ({ sidebarActive }: HeaderProps) => {
  const { authenticated, name } = useAuth();
  return (
    <div className="flex h-14 w-full items-center justify-between px-3">
      <div className="flex">
        <div
          className={`${sidebarActive ? "" : "md:w-9"} w-9 transition-[width] duration-500 ease-in-out md:w-0`}
        ></div>
        <Link to="/" className="flex h-full items-center">
          Asset Manager
        </Link>
      </div>
      <UserBadge
        authenticated={authenticated}
        name={name}
        className="hidden md:inline-block"
      />
    </div>
  );
};

export default Header;
