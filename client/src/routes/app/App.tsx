import { Outlet } from "react-router";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Background from "./components/Background";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { AlignJustify } from "lucide-react";

export default function App() {
  return (
    <SidebarProvider>
      <div className="relative flex h-full w-full">
        <Sidebar />
        <Main>
          <Outlet />
        </Main>
        <Background />
        <div className="absolute z-50 flex h-14 w-14 items-center justify-center">
          <SidebarButton />
        </div>
      </div>
    </SidebarProvider>
  );
}

function SidebarButton() {
  const { sidebarActive, setSidebarActive } = useSidebar();
  return (
    <AlignJustify
      className={`h-6 w-6 ${sidebarActive ? "text-white" : ""} cursor-pointer transition-all duration-500`}
      onClick={() => setSidebarActive(!sidebarActive)}
    />
  );
}
