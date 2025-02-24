import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import AssetForm from "./AssetForm";
import { useState } from "react";
import { X } from "lucide-react";

function AddAsset() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-row-reverse">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>
          <Button variant={"secondary"}>Add Asset</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="dark sm:max-w-2xl overflow-y-auto max-h-screen">
          <div
            className="absolute right-4 top-4 text-white cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </div>
          <AssetForm closeDialog={() => setOpen(false)} />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddAsset;
