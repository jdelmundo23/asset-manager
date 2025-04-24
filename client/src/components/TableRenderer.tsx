import { Column, Table as DataTable, flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./shadcn-ui/table";
import { FilterBox } from "@/components/Filtering";
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from "lucide-react";

const SortArrow = <T,>({ column }: { column: Column<T, unknown> }) => {
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

interface TableRendererProps<T> {
  table: DataTable<T>;
  columnLength: number;
}

export default function TableRenderer<T>({
  table,
  columnLength,
}: TableRendererProps<T>) {
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
                <TableCell colSpan={columnLength} className="h-24 text-center">
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
