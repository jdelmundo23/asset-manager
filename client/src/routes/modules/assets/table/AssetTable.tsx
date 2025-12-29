import {
  ColumnFiltersState,
  ColumnSizingState,
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

interface AssetTableProps {
  assets: AssetRow[] | undefined;
  hideColumns?: string[];
  selectedRows?: RowSelectionState;
  onRowSelect?: Dispatch<SetStateAction<RowSelectionState>>;
  columnOrder?: string[];
  setColumnOrder?: React.Dispatch<React.SetStateAction<string[]>>;
  singleSelect?: boolean;
  animated?: boolean;
}

export function useAssetTable({
  assets = [],
  hideColumns = [],
  selectedRows,
  onRowSelect,
  singleSelect,
  animated,
  columnOrder,
  setColumnOrder,
}: AssetTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnSizing, setColSizing] = useState<ColumnSizingState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const rowSelection = selectedRows ?? {};

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
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
    onColumnSizingChange: setColSizing,
    getRowId: (row) => row.ID.toString(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnOrderChange: setColumnOrder,
    defaultColumn: { minSize: 25 },
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnSizing,
      columnOrder,
      pagination,
    },
  });

  return {
    table: table,
    tableRender: (
      <TableRenderer
        table={table}
        columnLength={columns.length}
        singleSelect={singleSelect}
        animated={animated}
        schema={assetSchema.innerType()}
      />
    ),
  };
}
