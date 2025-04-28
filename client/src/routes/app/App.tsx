import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import { Toaster } from "sonner";
import { AlignJustify } from "lucide-react";
import Background from "./components/Background";

function App() {
  const [sidebarActive, setSideBarActive] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarActive");
    return stored ? JSON.parse(stored) : false;
  });

  const changeSidebarState = (state: boolean) => {
    setSideBarActive(state);
    localStorage.setItem("sidebarActive", JSON.stringify(state));
  };

  return (
    <div className="relative flex h-full w-full">
      <Toaster richColors />
      <Sidebar active={sidebarActive} setSidebarActive={changeSidebarState} />
      <Main sidebarActive={sidebarActive}>
        <Outlet />
      </Main>
      <Background
        sidebarActive={sidebarActive}
        disableSidebar={() => changeSidebarState(false)}
      />
      <div className="absolute z-50 flex h-14 w-14 items-center justify-center">
        <AlignJustify
          className={`h-6 w-6 ${sidebarActive ? "text-white" : ""} cursor-pointer transition-all duration-500`}
          onClick={() => changeSidebarState(!sidebarActive)}
        />
      </div>
    </div>
  );
}

export default App;
