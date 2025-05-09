import { useFetcher, useLoaderData } from "react-router";
import { DataTable } from "./table/AssetTable";
import axios from "axios";
import { AddAsset } from "./components/ActionDialogs";
import AssetContext from "@/context/AssetContext";
import { assetSchema } from "@shared/schemas";
import { z } from "zod";

import TableToolbar from "@/components/TableToolbar";
import { useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import BulkActionDropdown from "../../../components/BulkActionDropdown";

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
    const parsedAssets = z.array(assetSchema).parse(assetRes.data ?? []);

    return {
      assets: parsedAssets,
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
  const fetcher = useFetcher();
  const data = fetcher.data || useLoaderData();
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  return (
    <div className="dark container mx-auto flex w-11/12 flex-col gap-2 py-10">
      <AssetContext.Provider value={{ ...data, fetcher }}>
        <TableToolbar tableTitle="Assets">
          <div className="flex gap-x-1">
            <BulkActionDropdown
              entity={"asset"}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              deleting
              duplicating
            />
            <AddAsset />
          </div>
        </TableToolbar>
        <DataTable
          assets={data?.assets ?? []}
          selectedRow={selectedRows}
          onRowSelect={setSelectedRows}
          animated={true}
        />
      </AssetContext.Provider>
    </div>
  );
}

export default Page;
