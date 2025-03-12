import { useState } from "react";
import axios from "axios";
import { Outlet, useLoaderData } from "react-router";
import AuthContext from "../../context/AuthContext";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import { Toaster } from "sonner";

axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL;
export async function loader() {
  try {
    const response = await axios.get(`${apiUrl}/auth/user`);
    return response.data;
  } catch {
    console.error("Not authenticated");
  }
}

function App() {
  const [sidebarActive, setSideBarActive] = useState<boolean>(true);
  const user = useLoaderData();

  return (
    <AuthContext.Provider value={user}>
      <Toaster richColors />
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
    </AuthContext.Provider>
  );
}

export default App;
