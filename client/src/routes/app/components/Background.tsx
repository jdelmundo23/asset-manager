interface BackgroundProps {
  sidebarActive: boolean;
  disableSidebar: () => void;
}

export default function Background({
  sidebarActive,
  disableSidebar,
}: BackgroundProps) {
  return (
    <div
      onClick={disableSidebar}
      className={`fixed h-screen w-screen bg-black/80 md:pointer-events-none md:opacity-0 ${sidebarActive ? "opacity-100" : "pointer-events-none opacity-0"} transition-opacity duration-500`}
    />
  );
}
