import { DataTable } from "./table/AssetTable";
import { AddAsset } from "./components/ActionDialogs";
import TableToolbar from "@/components/table/TableToolbar";
import { useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import BulkActionDropdown from "../../../components/table/BulkActionDropdown";
import { AssetProvider, useAssets } from "@/context/AssetContext";
import { TableConfigProvider } from "@/context/TableConfigContext";
import FileUpload from "./components/ImportDialog";
import { Button } from "@/components/shadcn-ui/button";
import {
  ChevronDown,
  ChevronsUpDown,
  CirclePlus,
  Plus,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";

function Page() {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  return (
    <div className="container mx-auto flex h-full w-11/12 flex-col gap-2 py-10">
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
        <>
          <SmallToolbar
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
          <LargeToolbar
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
        </>
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

interface ToolbarProps {
  selectedRows: RowSelectionState;
  setSelectedRows: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}

function SmallToolbar({ selectedRows, setSelectedRows }: ToolbarProps) {
  return (
    <div className="flex w-full justify-end gap-x-1 md:hidden">
      <BulkActionDropdown
        entity={"asset"}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        deleting
        duplicating
      >
        <Button
          variant={"secondary"}
          className="gap-x-0.5 px-3.5 transition-all"
        >
          Selected
          <ChevronsUpDown />
        </Button>
      </BulkActionDropdown>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant={"secondary"} className="gap-x-0.5 px-3.5">
            Actions
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <FileUpload>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex justify-between"
            >
              Import
              <Upload />
            </DropdownMenuItem>
          </FileUpload>
          <AddAsset>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex justify-between"
            >
              Add Asset <CirclePlus />
            </DropdownMenuItem>
          </AddAsset>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function LargeToolbar({ selectedRows, setSelectedRows }: ToolbarProps) {
  return (
    <div className="hidden w-full justify-end gap-x-1 md:flex">
      <BulkActionDropdown
        entity={"asset"}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        deleting
        duplicating
      >
        <Button variant={"secondary"} className="gap-x-1 transition-all">
          Selected
          <ChevronsUpDown className="hidden sm:block" />
        </Button>
      </BulkActionDropdown>
      <FileUpload>
        <Button variant={"secondary"} className="gap-x-1">
          Import
          <Upload className="hidden sm:block" />
        </Button>
      </FileUpload>
      <AddAsset>
        <Button variant={"secondary"} className="gap-x-1">
          Add Asset <Plus />
        </Button>
      </AddAsset>
    </div>
  );
}

export default Page;
