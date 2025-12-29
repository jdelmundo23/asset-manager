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
import { getColumns } from "./NetworkColumns";
import TableRenderer from "@/components/table/TableRenderer";
import { ipInputSchema, IPRow } from "@shared/schemas";

interface DataTableProps {
  ips: IPRow[] | undefined;
  hideColumns?: string[];
  selectedRow?: RowSelectionState;
  onRowSelect?: Dispatch<SetStateAction<RowSelectionState>>;
  animated?: boolean;
}

export function DataTable({
  ips = [],
  hideColumns = [],
  selectedRow,
  onRowSelect,
  animated,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnSizing, setColSizing] = useState<ColumnSizingState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const rowSelection = selectedRow ?? {};

  type Key = (typeof hideColumns)[number];
  const result: Record<Key, boolean> = {} as Record<Key, boolean>;
  for (const key of hideColumns) {
    result[key] = false;
  }

  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(result);

  const data = ips;
  const columns = getColumns();
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
    enableMultiRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
    onColumnSizingChange: setColSizing,
    getRowId: (row) => row.ID.toString(),
    getPaginationRowModel: getPaginationRowModel(),
    defaultColumn: { minSize: 25 },
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnSizing,
      pagination,
    },
  });

  return (
    <TableRenderer
      table={table}
      columnLength={columns.length}
      animated={animated}
      schema={ipInputSchema}
    />
  );
}
