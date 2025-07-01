import { DataTable } from "./table/AssetTable";
import { AddAsset } from "./components/ActionDialogs";
import AssetContext from "@/context/AssetContext";
import { assetRowSchema } from "@shared/schemas";
import { z } from "zod";
import TableToolbar from "@/components/TableToolbar";
import { useEffect, useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

const getAssetData = async () => {
  const [assetRes, locRes, depRes, typeRes, modelRes, usersRes] =
    await Promise.all([
      axiosApi.get(`/api/assets/all`),
      axiosApi.get(`/api/presets/locations`),
      axiosApi.get(`/api/presets/departments`),
      axiosApi.get(`/api/presets/assettypes`),
      axiosApi.get(`/api/presets/assetmodels`),
      axiosApi.get(`/api/users/all`),
    ]);
  const parsedAssets = z.array(assetRowSchema).parse(assetRes.data);

  return {
    assets: parsedAssets,
    locations: locRes.data,
    departments: depRes.data,
    types: typeRes.data,
    models: modelRes.data,
    users: usersRes.data,
  };
};

function Page() {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  const assetQuery = useQuery({
    queryKey: ["assetData"],
    queryFn: getAssetData,
  });

  useEffect(() => {
    if (assetQuery.isError) {
      handleError(assetQuery.error);
    }
  }, [assetQuery.isError, assetQuery.error]);

  return (
    <div className="container mx-auto flex w-11/12 flex-col gap-2 py-10">
      <AssetContext.Provider
        value={{
          assets: assetQuery.data?.assets ?? [],
          locations: assetQuery.data?.locations ?? [],
          departments: assetQuery.data?.departments ?? [],
          types: assetQuery.data?.types ?? [],
          models: assetQuery.data?.models ?? [],
          users: assetQuery.data?.users ?? [],
        }}
      >
        <TableToolbar tableTitle="Assets">
          <div className="flex w-full justify-end gap-x-1">
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
          assets={assetQuery.data?.assets}
          selectedRow={selectedRows}
          onRowSelect={setSelectedRows}
          animated={true}
        />
      </AssetContext.Provider>
    </div>
  );
}

export default Page;
