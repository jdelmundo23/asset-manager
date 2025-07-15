import { useBulkAction } from "@/lib/bulkActions";
import { buttonVariants } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { RowSelectionState } from "@tanstack/react-table";
import { ChevronsUpDown, Copy, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionDropdownProps {
  entity: "asset" | "ip";
  editing?: boolean;
  duplicating?: boolean;
  deleting?: boolean;
  selectedRows: RowSelectionState;
  setSelectedRows: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}

export default function BulkActionDropdown({
  entity,
  editing,
  duplicating,
  deleting,
  selectedRows,
  setSelectedRows,
}: BulkActionDropdownProps) {
  const { handleBulkAction } = useBulkAction();
  const ids = Object.keys(selectedRows).filter((key) => selectedRows[key]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={Object.keys(selectedRows).length === 0}
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "gap-0 pl-3 transition-all"
        )}
      >
        <ChevronsUpDown />
        Bulk Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
        {editing && (
          <DropdownMenuItem>
            <Pencil />
            Edit
          </DropdownMenuItem>
        )}
        {duplicating && (
          <DropdownMenuItem
            onClick={() => handleBulkAction(entity, "duplicate", ids)}
          >
            <Copy />
            Duplicate
          </DropdownMenuItem>
        )}
        {deleting && (
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => {
              handleBulkAction(entity, "delete", ids);
              setSelectedRows({});
            }}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
