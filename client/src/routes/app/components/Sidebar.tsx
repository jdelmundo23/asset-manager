import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigation } from "react-router";
import { modules } from "@/lib/modules";

interface SidebarProps {
  active: boolean;
}

function Sidebar({ active }: SidebarProps) {
  const navigation = useNavigation();
  const [sidebarClicked, setSidebarClicked] = useState<boolean>(false);
  useEffect(() => {
    if (navigation.state !== "loading") {
      setSidebarClicked(false);
    }
  }, [navigation.location]);
  return (
    <nav
      className={`${active ? "w-[250px] border" : "w-0 border-0"} box-border hidden shrink-0 overflow-hidden border-zinc-600 bg-black text-white transition-[width,padding,border-width] duration-500 ease-in-out md:flex`}
    >
      <div className="mx-3 mt-28 flex w-full flex-col items-center">
        <ul className="flex w-full flex-col gap-y-3">
          {modules.map((module) => (
            <Link key={module.link} to={module.link}>
              <li
                className="nav-item flex items-center justify-between"
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
      </div>
    </nav>
  );
}
export default Sidebar;
