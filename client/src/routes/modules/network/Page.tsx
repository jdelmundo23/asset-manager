import { useFetcher, useLoaderData } from "react-router";
import IPContext from "@/context/IPContext";
import { assetSchema, IPRow, ipRowSchema, SubnetRow } from "@shared/schemas";
import { z } from "zod";
import { DataTable } from "./table/NetworkTable";
import TableToolbar from "@/components/TableToolbar";
import AddIP from "./components/AddIP";
import { useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import BulkActionDropdown from "@/components/BulkActionDropdown";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";
import SubnetComboxbox from "./components/subnets/SubnetCombobox";

export async function loader() {
  try {
    const [ipRes, assetRes] = await Promise.all([
      axiosApi.get(`/api/ips/all`),
      axiosApi.get(`/api/assets/all`),
    ]);
    const parsedIps = z.array(ipRowSchema).parse(ipRes.data ?? []);
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
  const [selectedSubnet, setSelectedSubnet] = useState<SubnetRow | undefined>();

  return (
    <div className="container mx-auto flex w-1/2 flex-col gap-2 py-10">
      <IPContext.Provider value={{ ...data, fetcher }}>
        <TableToolbar tableTitle="Network">
          <div className="ml-1 flex w-full justify-between">
            <SubnetComboxbox
              selectedSubnet={selectedSubnet}
              setSelectedSubnet={setSelectedSubnet}
            />
            <div className="flex gap-x-1">
              {/* <BulkActionDropdown
                entity={"ip"}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                deleting
              />
               */}
              <AddIP />
            </div>
          </div>
        </TableToolbar>
        <DataTable
          ips={
            data?.ips
              ? selectedSubnet
                ? data.ips.filter(
                    (ip: IPRow) => ip.subnetID === selectedSubnet.ID
                  )
                : data.ips
              : []
          }
          selectedRow={selectedRows}
          onRowSelect={setSelectedRows}
          animated={true}
        />
      </IPContext.Provider>
    </div>
  );
}

export default Page;
