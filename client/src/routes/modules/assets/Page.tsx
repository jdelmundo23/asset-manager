import { DataTable } from "./table/AssetTable";
import { AddAsset } from "./components/ActionDialogs";
import TableToolbar from "@/components/TableToolbar";
import { useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import BulkActionDropdown from "../../../components/BulkActionDropdown";
import { AssetProvider, useAssets } from "@/context/AssetContext";

function Page() {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  return (
    <div className="container mx-auto flex w-11/12 flex-col gap-2 py-10">
      <AssetProvider>
        <AssetPageContent
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      </AssetProvider>
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
