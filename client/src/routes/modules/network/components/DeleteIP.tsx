import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn-ui/alert-dialog";
import { useHandleAction } from "@/lib/Actions";
import { IPRow } from "@shared/schemas";

interface DeleteIPProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  row: IPRow;
}

function DeleteIP({ open, setOpen, row }: DeleteIPProps) {
  const { handleAction } = useHandleAction<IPRow, unknown>();
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the item from the list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleAction("ip", "delete", row)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteIP;
