import { useSidebar } from "@/context/SidebarContext";

export default function Background() {
  const { setSidebarActive, sidebarActive } = useSidebar();
  return (
    <div
      onClick={() => setSidebarActive(false)}
      className={`fixed min-h-screen w-full bg-black/80 md:pointer-events-none md:opacity-0 ${sidebarActive ? "opacity-100" : "pointer-events-none opacity-0"} transition-opacity duration-500`}
    />
  );
}
