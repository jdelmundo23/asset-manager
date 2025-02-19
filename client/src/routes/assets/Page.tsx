import { useLoaderData } from "react-router";
import { getColumns } from "./components/Columns";
import { DataTable } from "./components/DataTable";
import axios from "axios";
import AddAsset from "./components/AddAsset";

type tableData = {
  assets: [];
  locations: [];
  departments: [];
  types: [];
  models: [];
};

axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL;

export async function loader(): Promise<tableData | undefined> {
  try {
    const [assetRes, locRes, depRes, typeRes, modelRes] = await Promise.all([
      axios.get(`${apiUrl}/api/assets/all`),
      axios.get(`${apiUrl}/api/presets/locations`),
      axios.get(`${apiUrl}/api/presets/departments`),
      axios.get(`${apiUrl}/api/presets/assettypes`),
      axios.get(`${apiUrl}/api/presets/assetmodels`),
    ]);
    return {
      assets: assetRes.data,
      locations: locRes.data,
      departments: depRes.data,
      types: typeRes.data,
      models: modelRes.data,
    };
  } catch {
    console.error("Not authenticated");
  }
}

function Page() {
  const data = useLoaderData();

  return (
    <div className="dark container mx-auto py-10 flex flex-col gap-2">
      <AddAsset />
      <DataTable
        columns={getColumns(
          data.locations,
          data.departments,
          data.types,
          data.models,
        )}
        data={data.assets}
      />
    </div>
  );
}

export default Page;
