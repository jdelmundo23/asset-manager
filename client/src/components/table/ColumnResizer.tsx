import { Header, Table } from "@tanstack/react-table";
import { useRef } from "react";
import ReactDOM from "react-dom";

export function ColumnResizer<T>({
  header,
  table,
}: {
  header: Header<T, unknown>;
  table: Table<T>;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  if (header.column.getCanResize() === false) return <></>;

  return (
    <div
      aria-label="Column resizer"
      ref={parentRef}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      className={`active:!bg-background border-muted-foreground absolute right-0 top-0 z-10 flex h-full cursor-col-resize items-center overflow-hidden hover:bg-gray-700 active:left-0 active:px-2 group-hover:border-r-2 group-hover:bg-white`}
      style={{
        userSelect: "none",
        touchAction: "none",
        width: header.column.getIsResizing()
          ? `calc(100% + ${table.getState().columnSizingInfo.deltaOffset}px)`
          : "0px",
        minWidth: header.column.getIsResizing() ? "25px" : "0px",
      }}
    >
      {header.column.getIsResizing() ? (
        <span className="overflow-hidden text-nowrap text-white">
          {header.isPlaceholder ? null : <>{header.column.columnDef.header}</>}
        </span>
      ) : (
        <></>
      )}
      {header.column.getIsResizing() &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-[999] cursor-col-resize"
            style={{ pointerEvents: "all", background: "transparent" }}
          />,
          document.body
        )}
    </div>
  );
}
