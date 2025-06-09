import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Dispatch, SetStateAction, useState } from "react";
import { getColumns } from "./NetworkColumns";
import TableRenderer from "@/components/TableRenderer";
import { IPRow, ipRowSchema } from "@shared/schemas";

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
    getRowId: (row) => row.ID.toString(),
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
      animated={animated}
      schema={ipRowSchema}
    />
  );
}
