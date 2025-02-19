import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import AssetForm from "./AssetForm";
import { useState } from "react";

function AddAsset() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-row-reverse">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>
          <Button variant={"secondary"}>Add Asset</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="dark sm:max-w-2xl">
          {/* <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Add Asset
            </AlertDialogTitle>
          </AlertDialogHeader> */}
          <AssetForm closeDialog={() => setOpen(false)} />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddAsset;
