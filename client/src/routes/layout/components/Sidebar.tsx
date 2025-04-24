import { Link } from "react-router";

interface SidebarProps {
  active: boolean;
}

function Sidebar({ active }: SidebarProps) {
  return (
    <nav
      className={`${active ? "w-[250px]" : "w-0"} box-border flex overflow-hidden border border-zinc-600 bg-zinc-900 text-white transition-[width,padding] duration-500 ease-in-out`}
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
