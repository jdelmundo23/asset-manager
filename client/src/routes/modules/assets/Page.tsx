import { useAssetTable } from "./table/AssetTable";
import { AddAsset } from "./components/ActionDialogs";
import TableToolbar from "@/components/table/TableToolbar";
import { useState } from "react";
import { RowSelectionState, Table } from "@tanstack/react-table";
import BulkActionDropdown from "../../../components/table/BulkActionDropdown";
import { AssetProvider, useAssets } from "@/context/AssetContext";
import { TableConfigProvider } from "@/context/TableConfigContext";
import FileUpload from "./components/ImportDialog";
import { Button } from "@/components/shadcn-ui/button";
import {
  ChevronDown,
  ChevronsUpDown,
  CirclePlus,
  LucideColumns,
  Plus,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import ColumnDialog from "./components/ColumnDialog";

function Page() {
  return (
    <div className="container mx-auto flex h-full w-11/12 flex-col gap-2 py-10">
      <TableConfigProvider endpoint="/api/assets" queryKey={["assetData"]}>
        <AssetProvider>
          <AssetPageContent />
        </AssetProvider>
      </TableConfigProvider>
    </div>
  );
}

function AssetPageContent() {
  const { assets } = useAssets();
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  const { table, tableRender } = useAssetTable({
    assets,
    selectedRows,
    onRowSelect: setSelectedRows,
    columnOrder,
    setColumnOrder,
    animated: true,
  });

  function onColumnReorder(activeId: string, overId: string) {
    const order = table.getAllLeafColumns().map((col) => col.id);

    const activeIndex = order.indexOf(activeId);

    if (activeIndex === -1) return;

    order.splice(activeIndex, 1);

    if (overId === "start") {
      order.splice(1, 0, activeId);
      table.setColumnOrder(order);
      return;
    }

    const overIndex = order.indexOf(overId);
    if (overIndex === -1) return;

    let insertIndex = overIndex + 1;

    if (insertIndex === 0) insertIndex = 1;

    order.splice(insertIndex, 0, activeId);

    table.setColumnOrder(order);
  }

  return (
    <>
      <TableToolbar tableTitle="Assets">
        <>
          <LargeToolbar
            table={table}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            onColumnReorder={onColumnReorder}
          />
          <SmallToolbar
            table={table}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            onColumnReorder={onColumnReorder}
          />
        </>
      </TableToolbar>
      {tableRender}
    </>
  );
}

interface ToolbarProps<T> {
  table: Table<T>;
  selectedRows: RowSelectionState;
  setSelectedRows: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  onColumnReorder: (activeId: string, overId: string) => void;
}

function SmallToolbar<T>({
  table,
  selectedRows,
  setSelectedRows,
  onColumnReorder,
}: ToolbarProps<T>) {
  const filtered = table
    .getAllLeafColumns()
    .filter(
      (column) => !column.getIsFirstColumn() && !column.getIsLastColumn()
    );

  return (
    <div className="flex w-full justify-end gap-x-1 md:hidden">
      <ColumnDialog columns={filtered} onColumnReorder={onColumnReorder}>
        <Button
          variant={"secondary"}
          className="gap-x-1 px-2.5"
          aria-label="Columns"
        >
          <LucideColumns />
        </Button>
      </ColumnDialog>
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

function LargeToolbar<T>({
  table,
  selectedRows,
  setSelectedRows,
  onColumnReorder,
}: ToolbarProps<T>) {
  const filtered = table
    .getAllLeafColumns()
    .filter(
      (column) => !column.getIsFirstColumn() && !column.getIsLastColumn()
    );

  return (
    <div className="hidden w-full justify-end gap-x-1 md:flex">
      <ColumnDialog columns={filtered} onColumnReorder={onColumnReorder}>
        <Button variant={"secondary"} className="gap-x-1">
          Columns <LucideColumns />
        </Button>
      </ColumnDialog>
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
