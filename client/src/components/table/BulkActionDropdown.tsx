import { useBulkAction } from "@/lib/bulkActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { RowSelectionState } from "@tanstack/react-table";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { GenericDialog } from "@/routes/modules/assets/components/ActionDialogs";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "../shadcn-ui/alert-dialog";
import { useState } from "react";
import AdminAction from "../AdminAction";

interface BulkActionDropdownProps {
  children: React.ReactNode;
  entity: "asset" | "ip";
  editing?: boolean;
  duplicating?: boolean;
  deleting?: boolean;
  selectedRows: RowSelectionState;
  setSelectedRows: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}

export default function BulkActionDropdown({
  children,
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
        asChild
        disabled={Object.keys(selectedRows).length === 0}
      >
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
        {editing && (
          <AdminAction>
            <DropdownMenuItem>
              <Pencil />
              Edit
            </DropdownMenuItem>
          </AdminAction>
        )}
        {duplicating && (
          <BulkDuplicate
            onClick={() => handleBulkAction(entity, "duplicate", ids)}
          >
            <AdminAction>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Copy />
                Duplicate
              </DropdownMenuItem>
            </AdminAction>
          </BulkDuplicate>
        )}
        {deleting && (
          <BulkDelete
            onClick={() => {
              handleBulkAction(entity, "delete", ids);
              setSelectedRows({});
            }}
          >
            <AdminAction>
              <DropdownMenuItem
                className="text-red-600"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </AdminAction>
          </BulkDelete>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BulkDuplicate({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <GenericDialog
      content={
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={onClick}>Duplicate</AlertDialogAction>
        </AlertDialogFooter>
      }
      open={open}
      setOpen={setOpen}
      title="Confirm Bulk Duplication?"
      description="The duplicated rows will apend “- Copy” to the name, and the identifier will be left blank."
    >
      {children}
    </GenericDialog>
  );
}

function BulkDelete({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <GenericDialog
      content={
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>

          <AlertDialogAction
            className="bg-destructive text-destructive-foreground"
            onClick={onClick}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      }
      open={open}
      setOpen={setOpen}
      title="Confirm Bulk Duplication"
      description="This action will permanently delete the selected rows."
    >
      {children}
    </GenericDialog>
  );
}
