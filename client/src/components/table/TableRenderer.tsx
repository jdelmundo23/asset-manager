import {
  Cell,
  Column,
  Table as DataTable,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../shadcn-ui/table";
import { FilterBox } from "@/components/table/Filters";
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from "lucide-react";
import { ZodObject, ZodRawShape } from "zod";
import { EditCell } from "./EditCell";
import { ScrollArea, ScrollBar } from "../shadcn-ui/scroll-area";
import { Button } from "../shadcn-ui/button";
import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn-ui/select";

const SortArrow = <T,>({ column }: { column: Column<T, unknown> }) => {
  let arrow: JSX.Element = <></>;
  switch (column.getIsSorted()) {
    case false:
      arrow = (
        <ArrowUpDown
          className={`hover:bg-muted h-4 w-4 cursor-pointer rounded-sm opacity-0 group-hover:opacity-100`}
          onClick={() => column.toggleSorting(false)}
        />
      );
      break;
    case "asc":
      arrow = (
        <ArrowUp
          className={`hover:bg-muted h-4 w-4 cursor-pointer rounded-sm`}
          onClick={() => column.toggleSorting(true)}
        />
      );
      break;
    case "desc":
      arrow = (
        <ArrowDown
          className={`hover:bg-muted h-4 w-4 cursor-pointer rounded-sm`}
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
  singleSelect?: boolean;
  animated?: boolean;
  schema?: ZodObject<ZodRawShape>;
}

export default function TableRenderer<T>({
  table,
  columnLength,
  singleSelect,
  animated,
  schema,
}: TableRendererProps<T>) {
  return (
    <>
      <ScrollArea
        className={`${animated ? "animate-fade-in-up" : ""} max-h-full rounded-md bg-white drop-shadow-md`}
        barPadding={{ top: 52, bottom: 10 }}
      >
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="group relative px-0 first:pl-0.5 last:w-0 last:pr-0.5"
                    >
                      <div className="relative rounded-sm px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-black hover:text-white group-last:pointer-events-none">
                        <div className="flex items-center gap-x-0.5 whitespace-nowrap">
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
                                  className={`h-4 w-4 cursor-pointer rounded-sm ${header.column.getIsFiltered() ? "" : "opacity-0"} hover:bg-muted group-hover:opacity-100`}
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
                  className="h-[60px] border-b-2 border-zinc-100"
                  onClick={
                    singleSelect ? () => row.toggleSelected(true) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <MemoCell
                      key={cell.id}
                      cell={cell}
                      rowId={row.id}
                      schema={schema}
                    />
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

        <ScrollBar orientation="horizontal" className="ml-[10px]" />
      </ScrollArea>

      <div className="animate-fade-in-up flex">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length > 0 && !singleSelect
            ? `${table.getFilteredSelectedRowModel().rows.length} of
          ${table.getFilteredRowModel().rows.length} row(s) selected`
            : `${table.getRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) displayed`}
        </div>
        <div className="flex items-center justify-end space-x-2 py-1">
          <Select
            onValueChange={(str) => {
              table.setPageSize(Number(str));
            }}
            defaultValue={String(table.getState().pagination.pageSize)}
          >
            <SelectTrigger className="bg-secondary text-secondary-foreground h-8 w-16 font-semibold">
              <SelectValue defaultValue={"10"} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25].map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

interface MemoCellProps<T> {
  cell: Cell<T, unknown>;
  rowId: string;
  schema?: ZodObject<ZodRawShape>;
}

function MemoCellInner<T>({ cell, rowId, schema }: MemoCellProps<T>) {
  return (
    <TableCell className="group px-0 first:pl-0.5 last:py-0 hover:bg-slate-400/30">
      <div className="flex items-center justify-between gap-x-2 px-2">
        <p className="min-w-0 flex-1 break-words group-last:px-1">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </p>
        {schema && cell.column.columnDef.meta?.canEdit !== false ? (
          <EditCell
            column={cell.column}
            currentValue={cell.getValue()}
            ID={rowId}
            schema={schema}
          />
        ) : (
          <div className="h-4 w-4"></div>
        )}
      </div>
    </TableCell>
  );
}

export const MemoCell = memo(MemoCellInner) as <T>(
  props: MemoCellProps<T>
) => JSX.Element;
