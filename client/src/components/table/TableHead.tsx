import {
  Column,
  flexRender,
  Header as HeaderType,
  Table,
} from "@tanstack/react-table";
import { TableHead } from "../shadcn-ui/table";
import { TruncateHover } from "../TruncateHover";
import { FilterBox } from "./Filters";
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from "lucide-react";
import { ColumnResizer } from "./ColumnResizer";

const SortArrow = <T,>({ column }: { column: Column<T, unknown> }) => {
  let arrow: JSX.Element = <></>;
  switch (column.getIsSorted()) {
    case false:
      arrow = (
        <button
          aria-label="Sort"
          onClick={() => column.toggleSorting(false)}
          className="opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <ArrowUpDown
            className={`hover:bg-muted h-4 min-w-4 cursor-pointer rounded-sm`}
          />
        </button>
      );
      break;
    case "asc":
      arrow = (
        <button aria-label="Sort up" onClick={() => column.toggleSorting(true)}>
          <ArrowUp
            className={`hover:bg-muted h-4 min-w-4 cursor-pointer rounded-sm`}
          />
        </button>
      );
      break;
    case "desc":
      arrow = (
        <button
          aria-label="Sort down"
          onClick={() => column.toggleSorting(false)}
        >
          <ArrowDown
            className={`hover:bg-muted h-4 min-w-4 cursor-pointer rounded-sm`}
          />
        </button>
      );
      break;
  }
  return arrow;
};

interface TableHeadProps<T> {
  header: HeaderType<T, unknown>;
  table: Table<T>;
}

export default function MyTableHead<T>({ header, table }: TableHeadProps<T>) {
  return (
    <TableHead
      className="group relative px-0 first:pl-0.5 last:w-0 last:pr-0.5"
      style={{
        width: header.getSize(),
      }}
    >
      <div className="relative rounded-sm px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-black hover:text-white group-last:pointer-events-none">
        <div className="flex items-center gap-x-0.5 whitespace-nowrap">
          <TruncateHover>
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </TruncateHover>

          <div className="flex flex-1 justify-between overflow-hidden">
            {header.column.columnDef.meta?.type ? (
              <FilterBox
                type={header.column.columnDef.meta?.type}
                column={header.column}
              >
                <button
                  aria-label="Filter column"
                  className={`flex ${header.column.getIsFiltered() ? "" : "opacity-0"} focus-visible:opacity-100 group-hover:opacity-100`}
                >
                  <Filter
                    className={`hover:bg-muted h-4 w-4 cursor-pointer rounded-sm`}
                  />
                </button>
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
      <ColumnResizer header={header} table={table} />
    </TableHead>
  );
}
