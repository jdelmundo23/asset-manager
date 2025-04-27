import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import { Toaster } from "sonner";
import { AlignJustify } from "lucide-react";

function App() {
  const [sidebarActive, setSideBarActive] = useState<boolean>(true);

  return (
    <div className="relative flex h-full w-full">
      <Toaster richColors />
      <Sidebar active={sidebarActive} setSidebarActive={setSideBarActive} />
      <Main sidebarActive={sidebarActive}>
        <Outlet />
      </Main>
      <div className="absolute z-50 flex h-14 w-14 items-center justify-center">
        <AlignJustify
          className={`h-6 w-6 ${sidebarActive ? "text-white" : ""} cursor-pointer transition-all duration-500`}
          onClick={() => setSideBarActive(!sidebarActive)}
        />
      </div>
    </div>
  );
}

export default App;
