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
import { handleAction } from "@/components/Actions";
import { AssetRow } from "@shared/schemas";
import { FetcherWithComponents } from "react-router";

interface DeleteAssetProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  row: AssetRow;
  fetcher: FetcherWithComponents<any> | undefined;
}

function DeleteAsset({ open, setOpen, row, fetcher }: DeleteAssetProps) {
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
            onClick={() => handleAction("asset", "delete", row, fetcher)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAsset;
