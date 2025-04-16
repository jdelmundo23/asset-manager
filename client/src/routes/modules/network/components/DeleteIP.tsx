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
import { handleAction } from "../../assets/components/Actions";
import { IPRow } from "@shared/schemas";
import { FetcherWithComponents } from "react-router";

interface DeleteIPProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  row: IPRow;
  fetcher: FetcherWithComponents<any> | undefined;
}

function DeleteIP({ open, setOpen, row, fetcher }: DeleteIPProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="dark">
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
          <AlertDialogAction
            onClick={() => handleAction("ip", "delete", row, fetcher)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteIP;
