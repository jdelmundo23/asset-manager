import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Dispatch, SetStateAction, useState } from "react";
import { getColumns } from "./AssetColumns";
import { AssetRow, assetSchema } from "@shared/schemas";
import TableRenderer from "@/components/table/TableRenderer";
import { useAssets } from "@/context/AssetContext";

interface DataTableProps {
  assets: AssetRow[] | undefined;
  hideColumns?: string[];
  selectedRow?: RowSelectionState;
  onRowSelect?: Dispatch<SetStateAction<RowSelectionState>>;
  singleSelect?: boolean;
  animated?: boolean;
}

export function DataTable({
  assets = [],
  hideColumns = [],
  selectedRow,
  onRowSelect,
  singleSelect,
  animated,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const rowSelection = selectedRow ?? {};

  type Key = (typeof hideColumns)[number];
  const result: Record<Key, boolean> = {} as Record<Key, boolean>;
  for (const key of hideColumns) {
    result[key] = false;
  }

  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(result);

  const data = assets;
  const contextData = singleSelect ? undefined : useAssets();
  const columns = getColumns(
    contextData?.locations,
    contextData?.departments,
    contextData?.types,
    contextData?.models,
    contextData?.users
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: onRowSelect,
    enableMultiRowSelection: !singleSelect,
    getRowId: (row) => row.ID.toString(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <TableRenderer
      table={table}
      columnLength={columns.length}
      singleSelect={singleSelect}
      animated={animated}
      schema={assetSchema.innerType()}
    />
  );
}
