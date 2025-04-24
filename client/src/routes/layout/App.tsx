import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";

function App() {
  const [sidebarActive, setSideBarActive] = useState<boolean>(true);

  return (
    <div className="flex h-full w-full">
      <Sidebar active={sidebarActive} />
      <Main sidebarActive={sidebarActive}>
        <Outlet />
      </Main>
      <div className="absolute flex h-14 w-14 items-center justify-center">
        <button
          className={`h-6 w-6 border border-white`}
          onClick={() => setSideBarActive(!sidebarActive)}
        />
      </div>
    </div>
  );
}

export default App;
