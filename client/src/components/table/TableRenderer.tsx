import { Table as DataTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../shadcn-ui/table";
import { ZodObject, ZodRawShape } from "zod";
import { ScrollArea, ScrollBar } from "../shadcn-ui/scroll-area";
import { Button } from "../shadcn-ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn-ui/select";
import { MemoCell, MemoCellInner } from "./TableCell";
import MyTableHead from "./TableHead";

interface BaseRow {
  rowVersion: string;
}

interface TableRendererProps<T extends BaseRow> {
  table: DataTable<T>;
  columnLength: number;
  singleSelect?: boolean;
  animated?: boolean;
  schema?: ZodObject<ZodRawShape>;
}

export default function TableRenderer<T extends BaseRow>({
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
        <Table className="min-w-full table-fixed text-xs">
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <MyTableHead
                      key={header.id}
                      header={header}
                      table={table}
                    />
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
                  className="h-[35px] border-b-2 border-zinc-100"
                  onClick={
                    singleSelect ? () => row.toggleSelected(true) : undefined
                  }
                >
                  {row
                    .getVisibleCells()
                    .map((cell) =>
                      cell.column.columnDef.meta?.memo === false ? (
                        <MemoCellInner
                          key={cell.id}
                          cell={cell}
                          rowVersion={row.original.rowVersion}
                          rowId={row.id}
                          schema={schema}
                        />
                      ) : (
                        <MemoCell
                          key={cell.id}
                          cell={cell}
                          rowId={row.id}
                          rowVersion={row.original.rowVersion}
                          schema={schema}
                        />
                      )
                    )}
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
