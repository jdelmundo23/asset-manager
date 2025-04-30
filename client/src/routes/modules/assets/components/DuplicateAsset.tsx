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

interface DuplicateAssetProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  row: AssetRow;
  fetcher: FetcherWithComponents<any> | undefined;
}

function DuplicateAsset({ open, setOpen, row, fetcher }: DuplicateAssetProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="dark">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Are you sure you want to duplicate this asset?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The name will be updated to include “- Copy”, and the identifier
            will be left blank.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleAction("asset", "duplicate", row, fetcher)}
          >
            Duplicate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DuplicateAsset;
