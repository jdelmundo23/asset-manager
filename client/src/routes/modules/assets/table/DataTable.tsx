import {
  Column,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import AssetContext from "@/context/AssetContext";
import { getColumns } from "./Columns";
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from "lucide-react";
import { AssetRow } from "@shared/schemas";
import { FilterBox } from "./Filtering";

const SortArrow = ({ column }: { column: Column<AssetRow, unknown> }) => {
  let arrow: JSX.Element = <></>;
  switch (column.getIsSorted()) {
    case false:
      arrow = (
        <ArrowUpDown
          className={`h-4 w-4 cursor-pointer rounded-sm opacity-0 hover:bg-zinc-700 group-hover:opacity-100`}
          onClick={() => column.toggleSorting(false)}
        />
      );
      break;
    case "asc":
      arrow = (
        <ArrowUp
          className={`h-4 w-4 cursor-pointer rounded-sm hover:bg-zinc-700`}
          onClick={() => column.toggleSorting(true)}
        />
      );
      break;
    case "desc":
      arrow = (
        <ArrowDown
          className={`h-4 w-4 cursor-pointer rounded-sm hover:bg-zinc-700`}
          onClick={() => column.toggleSorting(false)}
        />
      );
      break;
  }
  return arrow;
};

interface DataTableProps {
  assets: AssetRow[];
  detailed: boolean;
  selectedRow?: RowSelectionState;
  onRowSelect?: Dispatch<SetStateAction<RowSelectionState>>;
}

export function DataTable({
  assets,
  detailed,
  selectedRow,
  onRowSelect,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const rowSelection = selectedRow ?? {};

  const contextData = useContext(AssetContext);
  const data = assets;
  const columns = getColumns(
    contextData.locations,
    contextData.departments,
    contextData.types,
    contextData.models,
    contextData.users
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    detailed
      ? {}
      : {
          modelID: false,
          typeID: false,
          departmentID: false,
          locationID: false,
          assignedTo: false,
          purchaseDate: false,
          warrantyExp: false,
          cost: false,
          actions: false,
        }
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
    enableMultiRowSelection: false,
    getRowId: (row) => row.ID.toString(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>
      <div className="overflow-hidden rounded-md bg-white">
        <Table className="">
          <TableHeader className="bg-zinc-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="group relative px-0 first:pl-0.5 last:w-0 last:pr-0.5"
                    >
                      <div className="relative rounded-sm px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-black hover:text-white group-last:pointer-events-none">
                        <div className="flex items-center gap-x-0.5">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          <div className="flex flex-1 justify-between">
                            {header.column.columnDef.meta?.type ? (
                              <FilterBox
                                type={header.column.columnDef.meta?.type}
                                column={header.column}
                              >
                                <Filter
                                  className={`h-4 w-4 cursor-pointer rounded-sm ${header.column.getIsFiltered() ? "" : "opacity-0"} hover:bg-zinc-700 group-hover:opacity-100`}
                                />
                              </FilterBox>
                            ) : (
                              <div></div>
                            )}
                            {header.column.getCanSort() ? (
                              <SortArrow column={header.column} />
                            ) : (
                              <div></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b-2 border-zinc-100"
                  onClick={() => {
                    row.toggleSelected(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="group px-0 first:pl-0.5 last:py-0"
                    >
                      <p className="px-2 group-last:px-1">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </p>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
