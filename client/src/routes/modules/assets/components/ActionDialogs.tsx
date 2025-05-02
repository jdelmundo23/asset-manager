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
import { handleAction } from "@/lib/Actions";
import { AssetRow } from "@shared/schemas";
import { Button } from "@/components/shadcn-ui/button";
import { useContext, useState } from "react";
import AssetForm from "./AssetForm";
import { X } from "lucide-react";
import AssetContext from "@/context/AssetContext";

interface GenericDialogProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footerActions?: React.ReactNode;
  className?: string;
}

export function GenericDialog({
  open,
  setOpen,
  title,
  description,
  children,
  footerActions,
  className = "",
}: GenericDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className={`dark ${className}`}>
        <div
          className="absolute right-4 top-4 cursor-pointer text-white"
          onClick={() => setOpen(false)}
        >
          <X className="text-muted-foreground h-6 w-6" />
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {children}
        {footerActions && (
          <AlertDialogFooter>{footerActions}</AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AddAsset() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={"secondary"} onClick={() => setOpen(true)}>
        Add Asset
      </Button>
      <GenericDialog
        open={open}
        setOpen={setOpen}
        title="Add Asset"
        className="max-h-screen overflow-y-auto sm:max-w-2xl"
      >
        <AssetForm mode="add" closeDialog={() => setOpen(false)} />
      </GenericDialog>
    </>
  );
}

interface EditAssetProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  asset: AssetRow;
}

export function EditAsset({ open, setOpen, asset }: EditAssetProps) {
  return (
    <GenericDialog
      open={open}
      setOpen={setOpen}
      title="Edit Asset"
      className="max-h-screen overflow-y-auto sm:max-w-2xl"
    >
      <AssetForm mode="edit" closeDialog={() => setOpen(false)} asset={asset} />
    </GenericDialog>
  );
}

interface DeleteAssetProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  row: AssetRow;
}

export function DeleteAsset({ open, setOpen, row }: DeleteAssetProps) {
  const { fetcher } = useContext(AssetContext);
  return (
    <GenericDialog
      open={open}
      setOpen={setOpen}
      title="Are you absolutely sure?"
      description="This action will permanently delete the item from the list."
    >
      <AlertDialogFooter>
        <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => handleAction("asset", "delete", row, fetcher)}
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </GenericDialog>
  );
}

interface DuplicateAssetProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  row: AssetRow;
}

export function DuplicateAsset({ open, setOpen, row }: DuplicateAssetProps) {
  const { fetcher } = useContext(AssetContext);
  return (
    <GenericDialog
      open={open}
      setOpen={setOpen}
      title="Confirm Duplication"
      description="The name will be updated to include “- Copy”, and the identifier will be left blank."
    >
      <AlertDialogFooter>
        <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => handleAction("asset", "duplicate", row, fetcher)}
        >
          Duplicate
        </AlertDialogAction>
      </AlertDialogFooter>
    </GenericDialog>
  );
}
