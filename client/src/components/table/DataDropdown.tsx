import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../shadcn-ui/dropdown-menu";
import AdminAction from "../AdminAction";
import { FileDown, Upload } from "lucide-react";
import ExportDialog from "./ExportDialog";
import FileUpload from "@/routes/modules/assets/components/ImportDialog";
import { Table } from "@tanstack/react-table";
import { AssetRow } from "@shared/schemas";

export default function DataDropdown({
  children,
  table,
}: {
  children: React.ReactNode;
  table: Table<AssetRow>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
        <FileUpload>
          <AdminAction>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Upload className="hidden sm:block" />
              Import
            </DropdownMenuItem>
          </AdminAction>
        </FileUpload>
        <ExportDialog table={table}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <FileDown className="hidden sm:block" />
            Export
          </DropdownMenuItem>
        </ExportDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
