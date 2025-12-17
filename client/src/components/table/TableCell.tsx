import { Cell, flexRender } from "@tanstack/react-table";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { ZodObject, ZodRawShape } from "zod";
import { TruncateHover } from "../TruncateHover";
import { TableCell } from "../shadcn-ui/table";
import { EditCell } from "./EditCell";
import { Pencil } from "lucide-react";

interface MemoCellProps<T> {
  cell: Cell<T, unknown>;
  rowId: string;
  rowVersion: string;
  schema?: ZodObject<ZodRawShape>;
}

export function MemoCellInner<T>({
  cell,
  rowId,
  rowVersion,
  schema,
}: MemoCellProps<T>) {
  const [cellTruncated, setCellTruncated] = useState<boolean>(false);
  const value = cell.getValue();
  const rendered = useMemo(
    () => flexRender(cell.column.columnDef.cell, cell.getContext()),
    [cell]
  );

  const pencilRef = useRef<SVGSVGElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [pencilFits, setPencilFits] = useState(true);

  const textCell = (
    <TruncateHover
      onTruncateChange={setCellTruncated}
      className={`${cellTruncated ? "cursor-pointer" : ""}`}
    >
      {rendered}
    </TruncateHover>
  );

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    if (cell.column.getIsResizing()) return;

    const observer = new ResizeObserver(() => {
      if (pencilRef.current && parentRef.current) {
        const pencilRect = pencilRef.current.getBoundingClientRect();
        const parentRect = parentRef.current.getBoundingClientRect();

        setPencilFits(
          pencilRect.right > parentRect.right ||
            pencilRect.left < parentRect.left
        );
      }
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  return (
    <TableCell className="group px-0 py-1 first:pl-0.5 hover:bg-slate-400/30">
      <div className="flex items-center justify-between px-2">
        {typeof value === "string" || typeof value === "number" ? (
          schema && cell.column.columnDef.meta?.canEdit !== false ? (
            <EditCell
              column={cell.column}
              currentValue={cell.getValue()}
              ID={rowId}
              schema={schema}
              rowVersion={rowVersion}
            >
              {() => (
                <button
                  aria-label="Edit cell"
                  tabIndex={pencilFits ? undefined : -1}
                  className={`max-w-full ${pencilFits ? "" : "pointer-events-none"}`}
                >
                  {textCell}
                </button>
              )}
            </EditCell>
          ) : (
            textCell
          )
        ) : (
          rendered
        )}
        <div className="overflow-hidden" ref={parentRef}>
          {schema && cell.column.columnDef.meta?.canEdit !== false ? (
            <EditCell
              column={cell.column}
              currentValue={cell.getValue()}
              ID={rowId}
              schema={schema}
              rowVersion={rowVersion}
            >
              {(isOpen: boolean) => (
                <button
                  aria-label="Edit cell"
                  tabIndex={!pencilFits ? undefined : -1}
                  className={`flex opacity-0 focus-visible:opacity-100 group-hover:opacity-100 ${!isOpen ? "" : "opacity-100"} group-first:hidden group-last:hidden ${pencilFits ? "pointer-events-none !opacity-0" : ""}`}
                >
                  <Pencil ref={pencilRef} className={`h-4 w-4`} />
                </button>
              )}
            </EditCell>
          ) : (
            <></>
          )}
        </div>
      </div>
    </TableCell>
  );
}

export const MemoCell = memo(MemoCellInner, (prev, next) => {
  return (
    prev.rowId === next.rowId && prev.cell.getValue() === next.cell.getValue()
  );
}) as <T>(props: MemoCellProps<T>) => JSX.Element;
