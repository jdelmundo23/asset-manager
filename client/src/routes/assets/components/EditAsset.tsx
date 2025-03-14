import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AssetForm from "./AssetForm";
import { X } from "lucide-react";
import { AssetRow } from "@/types";

interface EditAssetProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  asset: AssetRow;
}

function EditAsset({ open, setOpen, asset }: EditAssetProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger></AlertDialogTrigger>
      <AlertDialogContent className="dark sm:max-w-2xl overflow-y-auto max-h-screen">
        <div
          className="absolute right-4 top-4 text-white cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <X className="w-6 h-6 text-muted-foreground" />
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
