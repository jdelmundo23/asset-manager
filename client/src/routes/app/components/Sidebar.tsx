import { Loader2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigation, useLocation } from "react-router";
import { modules } from "@/lib/modules";
import AuthContext from "@/context/AuthContext";
import UserBadge from "@/components/UserBadge";

interface SidebarProps {
  active: boolean;
  setSidebarActive: (value: boolean) => void;
}

function Sidebar({ active }: SidebarProps) {
  const user = useContext(AuthContext);
  const navigation = useNavigation();
  const location = useLocation();
  const [sidebarClicked, setSidebarClicked] = useState<boolean>(false);
  useEffect(() => {
    if (navigation.state !== "loading") {
      setSidebarClicked(false);
    }
  }, [navigation.location]);
  return (
    <nav
      className={`${active ? "w-[250px] border" : "w-0 border-0"} fixed z-50 box-border h-full overflow-hidden border-zinc-600 bg-black text-white transition-[width,padding,border-width] duration-500 ease-in-out md:static`}
    >
      <div className="flex h-full flex-col justify-between px-3 pb-3 pt-44">
        <ul className="flex w-full flex-col gap-y-3">
          {modules.map((module) => (
            <Link key={module.link} to={module.link}>
              <li
                className={`nav-item flex items-center justify-between ${location.pathname === module.link ? "hover:bg-foreground bg-white text-black" : ""}`}
                onClick={() => setSidebarClicked(true)}
              >
                <div className="flex items-center gap-2">
                  <module.icon className="h-4 w-4" />
                  {module.title}
                </div>
                {navigation.location?.pathname === module.link &&
                  sidebarClicked && (
                    <Loader2
                      className="flex h-5 w-5 animate-spin transition-all [transform-origin:center]"
                      color="gray"
                    />
                  )}
              </li>
            </Link>
          ))}
        </ul>
        <UserBadge
          authenticated={user.authenticated}
          name={user.name}
          className={`w-56 overflow-hidden md:hidden`}
        />
      </div>
    </nav>
  );
}
export default Sidebar;
