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
import Assets from "./routes/modules/assets/Page";
import Network from "./routes/modules/network/Page";
import Users from "./routes/modules/users/Page";
import AuthContext, { AuthContextType } from "./context/AuthContext";
import RedirectRoot from "./routes/RedirectRoot";
import { Toaster } from "sonner";
import PlaceholderRoute from "./routes/Placeholder";
import axiosApi from "./lib/axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

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
          <Route path="assets" element={<Assets />}></Route>
          <Route path="network" element={<Network />}></Route>
          <Route path="users" element={<Users />}></Route>
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
        const response = await axiosApi.get(`/auth/user`);
        setAuthInfo(response.data);
      } catch {
        console.error("Not authenticated");
      }
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authInfo}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>
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
