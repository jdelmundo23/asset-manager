import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
import AssetForm from "./AssetForm";
import { X } from "lucide-react";
import { AssetRow } from "@shared/schemas";

interface EditAssetProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  asset: AssetRow;
}

function EditAsset({ open, setOpen, asset }: EditAssetProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger></AlertDialogTrigger>
      <AlertDialogContent className="dark max-h-screen overflow-y-auto sm:max-w-2xl">
        <div
          className="absolute right-4 top-4 cursor-pointer text-white"
          onClick={() => setOpen(false)}
        >
          <X className="text-muted-foreground h-6 w-6" />
        </div>
        <AssetForm
          mode="edit"
          closeDialog={() => setOpen(false)}
          asset={asset}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EditAsset;
