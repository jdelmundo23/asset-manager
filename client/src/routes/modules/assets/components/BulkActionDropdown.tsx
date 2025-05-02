import { handleBulkAction } from "@/lib/BulkActions";
import { buttonVariants } from "@/components/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import AssetContext from "@/context/AssetContext";
import { cn } from "@/lib/utils";
import { RowSelectionState } from "@tanstack/react-table";
import { ChevronsUpDown, Copy, Pencil, Trash2 } from "lucide-react";
import { useContext } from "react";

interface BulkActionDropdownProps {
  selectedRows: RowSelectionState;
}

export default function BulkActionDropdown({
  selectedRows,
}: BulkActionDropdownProps) {
  const { fetcher } = useContext(AssetContext);
  const ids = Object.keys(selectedRows).filter((key) => selectedRows[key]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "secondary" }), "gap-0 pl-3")}
      >
        <ChevronsUpDown />
        Bulk Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent className="dark w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenuItem>
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => handleBulkAction("asset", "delete", ids, fetcher)}
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
