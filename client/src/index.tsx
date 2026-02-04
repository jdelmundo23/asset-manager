import React from "react";
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
import { AuthProvider } from "./context/AuthContext";
import RedirectRoot from "./routes/RedirectRoot";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Signout from "./routes/Signout";
import axios from "axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error?: unknown) => {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          return false;
        }

        return failureCount < 3;
      },
    },
  },
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={<RedirectRoot />}
        errorElement={<ErrorPage />}
      ></Route>
      <Route path="signin" element={<Signin />}></Route>
      <Route path="signout" element={<Signout />}></Route>
      <Route element={<Protected />}>
        <Route path="app" element={<App />}>
          <Route index element={<Menu />}></Route>
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Toaster richColors style={{ zIndex: 9999, pointerEvents: "auto" }} />
    <Root />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
