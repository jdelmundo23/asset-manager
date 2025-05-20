import { useFetcher, useLoaderData } from "react-router";
import IPContext from "@/context/IPContext";
import { assetSchema, ipSchema } from "@shared/schemas";
import { z } from "zod";
import { DataTable } from "./table/NetworkTable";
import TableToolbar from "@/components/TableToolbar";
import AddIP from "./components/AddIP";
import { useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import BulkActionDropdown from "@/components/BulkActionDropdown";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";

export async function loader() {
  try {
    const [ipRes, assetRes] = await Promise.all([
      axiosApi.get(`/api/ips/all`),
      axiosApi.get(`/api/assets/all`),
    ]);
    const parsedIps = z.array(ipSchema).parse(ipRes.data ?? []);
    const parsedAssets = z.array(assetSchema).parse(assetRes.data ?? []);

    return {
      ips: parsedIps,
      assets: parsedAssets,
    };
  } catch (error) {
    handleError(error);
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
          <div className="flex gap-x-1">
            <BulkActionDropdown
              entity={"ip"}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              deleting
            />
            <AddIP />
          </div>
        </TableToolbar>
        <DataTable
          ips={data?.ips}
          selectedRow={selectedRows}
          onRowSelect={setSelectedRows}
          animated={true}
        />
      </IPContext.Provider>
    </div>
  );
}

export default Page;
