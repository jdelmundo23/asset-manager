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
import { Row } from "@tanstack/react-table";

export default function DataDropdown<T>({
  children,
  filteredRows,
}: {
  children: React.ReactNode;
  filteredRows: Row<T>[];
}) {
  const data = filteredRows.map((row) => row.original);

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
        <ExportDialog filteredRows={filteredRows}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <FileDown className="hidden sm:block" />
            Export
          </DropdownMenuItem>
        </ExportDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
