import { Button } from "@/components/shadcn-ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
} from "@/components/shadcn-ui/item";
import { cn } from "@/lib/utils";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Column } from "@tanstack/react-table";
import { Equal, Eye, EyeOff } from "lucide-react";

interface ColumnDialogProps<T> {
  children: React.ReactNode;
  columns: Column<T, unknown>[];
  onColumnReorder: (activeId: string, overId: string) => void;
}

interface DragDropProps<T> {
  start?: boolean;
  column: Column<T, unknown>;
}

function DroppableSeparator<T>({ start, column }: DragDropProps<T>) {
  const { isOver, setNodeRef } = useDroppable({
    id: start ? "start" : column.id,
  });

  return (
    <div
      id={column.id}
      ref={setNodeRef}
      className={cn("py-1 opacity-0", isOver && "opacity-100")}
    >
      <div className="border-t-2 border-gray-300"></div>
    </div>
  );
}
function DraggableColumn<T>({ column }: DragDropProps<T>) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: column.id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: "100",
      }
    : undefined;

  return (
    <Item
      className={`flex-1 p-1 text-left ${!column.getIsVisible() && "text-muted-foreground/50"}`}
      variant={"muted"}
      style={style}
    >
      <ItemMedia
        variant="icon"
        className={`h-6 w-6 bg-transparent transition-colors hover:text-white ${transform && "text-white"}`}
      >
        <button
          aria-label="Move Column Order"
          {...listeners}
          {...attributes}
          className="cursor-ns-resize"
          ref={setNodeRef}
          id={column.id}
        >
          <Equal />
        </button>
      </ItemMedia>
      <ItemContent>{String(column.columnDef.header)}</ItemContent>
      <ItemActions>
        <Button
          aria-label="Toggle Column Visibility"
          variant={"outline"}
          className="h-6 w-6 bg-transparent px-0 py-0"
          onClick={() => {
            column.toggleVisibility();
          }}
        >
          {column.getIsVisible() ? <Eye /> : <EyeOff />}
        </Button>
      </ItemActions>
    </Item>
  );
}

export default function ColumnDialog<T>({
  children,
  columns,
  onColumnReorder,
}: ColumnDialogProps<T>) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="px-2 py-1">
        <DndContext
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={(event) => {
            const { active, over } = event;
            onColumnReorder(active.id.toString(), over?.id.toString() ?? "");
          }}
        >
          <ul>
            {columns.map((column, i) =>
              column.columnDef.header ? (
                <li key={column.id} className="group flex flex-col gap-x-1">
                  {i === 0 && <DroppableSeparator start column={column} />}
                  <DraggableColumn column={column}></DraggableColumn>
                  <DroppableSeparator column={column}></DroppableSeparator>
                </li>
              ) : null
            )}
          </ul>
        </DndContext>
      </PopoverContent>
    </Popover>
  );
}
