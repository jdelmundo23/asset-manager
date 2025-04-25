import { Link } from "react-router";

interface SidebarProps {
  active: boolean;
}

function Sidebar({ active }: SidebarProps) {
  return (
    <nav
      className={`${active ? "w-[250px] border" : "w-0 border-0"} box-border hidden overflow-hidden border-zinc-600 bg-black text-white transition-[width,padding,border-width] duration-500 ease-in-out md:flex`}
    >
      <div className="mx-3 mt-28 flex w-full flex-col items-center">
        <ul className="flex w-full flex-col gap-y-3">
          <Link to="/app/assets">
            <li className="nav-item">Assets</li>
          </Link>
          <Link to="/app/phones">
            <li className="nav-item">Phones</li>
          </Link>
          <Link to="/app/presets">
            <li className="nav-item">Presets</li>
          </Link>
          <Link to="/app/network">
            <li className="nav-item">Network</li>
          </Link>
        </ul>
      </div>
    </nav>
  );
}
export default Sidebar;
