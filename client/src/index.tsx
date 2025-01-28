import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App, { loader as AppAuthloader } from "./routes/App";
import reportWebVitals from "./reportWebVitals";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router";
import ErrorPage from "./error-page";
import Signin from "./routes/Signin";
import Dashboard from "./routes/Dashboard";
import Protected from "./routes/protected/Protected";
import Admin from "./routes/Admin";
import Presets from "./routes/presets/Page";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<App />}
      errorElement={<ErrorPage />}
      loader={AppAuthloader}
    >
      <Route path="signin" element={<Signin />}></Route>
      <Route element={<Protected />}>
        <Route path="dashboard" element={<Dashboard />}></Route>
        <Route path="admin" element={<Admin />}></Route>
        <Route path="admin/presets" element={<Presets />}></Route>
      </Route>
    </Route>,
  ),
);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
