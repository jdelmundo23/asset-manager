import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./routes/app/App";
import reportWebVitals from "./reportWebVitals";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router";
import ErrorPage from "./ErrorPage";
import Signin from "./routes/Signin";
import Protected from "./routes/Protected";
import Menu from "./routes/app/components/Menu";
import Presets from "./routes/modules/presets/Page";
import Assets, { loader as assetLoader } from "./routes/modules/assets/Page";
import Network, { loader as ipLoader } from "./routes/modules/network/Page";
import axios from "axios";
import AuthContext, { AuthContextType } from "./context/AuthContext";
import RedirectRoot from "./routes/RedirectRoot";
import { Toaster } from "sonner";
import PlaceholderRoute from "./routes/Placeholder";

axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL;

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={<RedirectRoot />}
        errorElement={<ErrorPage />}
      ></Route>
      <Route path="signin" element={<Signin />}></Route>
      <Route element={<Protected />}>
        <Route path="app" element={<App />}>
          <Route index element={<Menu />}></Route>
          <Route path="phones" element={<PlaceholderRoute />} />
          <Route path="presets" element={<Presets />}></Route>
          <Route
            path="assets"
            element={<Assets />}
            loader={assetLoader}
          ></Route>
          <Route path="network" element={<Network />} loader={ipLoader}></Route>
        </Route>
      </Route>
    </>
  )
);

const Root = () => {
  const [authInfo, setAuthInfo] = useState<AuthContextType>({
    authenticated: false,
  });
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`${apiUrl}/auth/user`);
        setAuthInfo(response.data);
      } catch {
        console.error("Not authenticated");
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={authInfo}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Toaster richColors />
    <Root />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
