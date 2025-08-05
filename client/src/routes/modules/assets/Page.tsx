import { DataTable } from "./table/AssetTable";
import { AddAsset } from "./components/ActionDialogs";
import TableToolbar from "@/components/table/TableToolbar";
import { useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import BulkActionDropdown from "../../../components/table/BulkActionDropdown";
import { AssetProvider, useAssets } from "@/context/AssetContext";
import { TableConfigProvider } from "@/context/TableConfigContext";

import FileUpload from "./components/FileUpload";

function Page() {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  return (
    <div className="container mx-auto flex w-11/12 flex-col gap-2 py-10">
      <TableConfigProvider endpoint="/api/assets" queryKey={["assetData"]}>
        <AssetProvider>
          <AssetPageContent
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
        </AssetProvider>
      </TableConfigProvider>
    </div>
  );
}

function AssetPageContent({
  selectedRows,
  setSelectedRows,
}: {
  selectedRows: RowSelectionState;
  setSelectedRows: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}) {
  const { assets } = useAssets();

  return (
    <>
      <TableToolbar tableTitle="Assets">
        <div className="flex w-full justify-end gap-x-1">
          <FileUpload />
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
        assets={assets}
        selectedRow={selectedRows}
        onRowSelect={setSelectedRows}
        animated={true}
      />
    </>
  );
}

export default Page;
