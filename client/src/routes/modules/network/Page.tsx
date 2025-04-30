import { useFetcher, useLoaderData } from "react-router";
import axios from "axios";
import IPContext from "@/context/IPContext";
import { assetSchema, ipSchema } from "@shared/schemas";
import { z } from "zod";
import { DataTable } from "./table/NetworkTable";
import TableToolbar from "@/components/TableToolbar";
import AddIP from "./components/AddIP";
import { useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";

axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL;

export async function loader() {
  try {
    const [ipRes, assetRes] = await Promise.all([
      axios.get(`${apiUrl}/api/ips/all`),
      axios.get(`${apiUrl}/api/assets/all`),
    ]);
    const parsedIps = z.array(ipSchema).parse(ipRes.data ?? []);
    const parsedAssets = z.array(assetSchema).parse(assetRes.data ?? []);

    return {
      ips: parsedIps,
      assets: parsedAssets,
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
    <div className="dark container mx-auto flex w-1/2 flex-col gap-2 py-10">
      <IPContext.Provider value={{ ...data, fetcher }}>
        <TableToolbar tableTitle="Network">
          <AddIP />
        </TableToolbar>
        <DataTable
          ips={data.ips}
          selectedRow={selectedRows}
          onRowSelect={setSelectedRows}
          animated={true}
        />
      </IPContext.Provider>
    </div>
  );
}

export default Page;
