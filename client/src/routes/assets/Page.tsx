import { useLoaderData } from "react-router";
import { DataTable } from "./components/DataTable";
import axios from "axios";
import AddAsset from "./components/AddAsset";
import AssetContext from "@/context/AssetContext";

axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL;

export async function loader() {
  try {
    const [assetRes, locRes, depRes, typeRes, modelRes, usersRes] =
      await Promise.all([
        axios.get(`${apiUrl}/api/assets/all`),
        axios.get(`${apiUrl}/api/presets/locations`),
        axios.get(`${apiUrl}/api/presets/departments`),
        axios.get(`${apiUrl}/api/presets/assettypes`),
        axios.get(`${apiUrl}/api/presets/assetmodels`),
        axios.get(`${apiUrl}/api/users/all`),
      ]);
    return {
      assets: assetRes.data ?? [],
      locations: locRes.data ?? [],
      departments: depRes.data ?? [],
      types: typeRes.data ?? [],
      models: modelRes.data ?? [],
      users: usersRes.data ?? [],
    };
  } catch {
    console.error("Not authenticated");
  }
}

function Page() {
  const data = useLoaderData();

  return (
    <div className="dark container mx-auto py-10 flex flex-col gap-2">
      <AssetContext.Provider value={data}>
        <AddAsset />
        <DataTable />
      </AssetContext.Provider>
    </div>
  );
}

export default Page;
