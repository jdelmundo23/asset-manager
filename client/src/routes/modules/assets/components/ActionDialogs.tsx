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
import { useHandleAction } from "@/lib/actions";
import { AssetRow } from "@shared/schemas";
import { useState } from "react";
import AssetForm from "./AssetForm";
import { X } from "lucide-react";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";

interface GenericDialogProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footerActions?: React.ReactNode;
  className?: string;
  content: React.ReactNode;
}

export function GenericDialog({
  open,
  setOpen,
  title,
  description,
  children,
  footerActions,
  className = "",
  content,
}: GenericDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className={` ${className}`}>
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
        {content}
        {footerActions && (
          <AlertDialogFooter>{footerActions}</AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AddAsset({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <GenericDialog
        content={<AssetForm mode="add" closeDialog={() => setOpen(false)} />}
        open={open}
        setOpen={setOpen}
        title="Add Asset"
        className="max-h-screen overflow-y-auto sm:max-w-2xl"
      >
        {children}
      </GenericDialog>
    </>
  );
}

interface EditAssetProps {
  children: React.ReactNode;
  ID: number;
}

export function EditAsset({ children, ID }: EditAssetProps) {
  const [open, setOpen] = useState(false);

  return (
    <GenericDialog
      content={
        <AssetForm mode="edit" closeDialog={() => setOpen(false)} ID={ID} />
      }
      open={open}
      setOpen={setOpen}
      title="Edit Asset"
      className="max-h-screen overflow-y-auto sm:max-w-2xl"
    >
      {children}
    </GenericDialog>
  );
}

interface DeleteAssetProps {
  children: React.ReactNode;
  row: AssetRow;
}

export function DeleteAsset({ children, row }: DeleteAssetProps) {
  const { handleAction } = useHandleAction<AssetRow, unknown>();
  const [open, setOpen] = useState(false);

  return (
    <GenericDialog
      content={
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>

          <AlertDialogAction
            className="bg-destructive text-destructive-foreground"
            onClick={() => handleAction("asset", "delete", row)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      }
      open={open}
      setOpen={setOpen}
      title="Are you absolutely sure?"
      description="This action will permanently delete the item from the list."
    >
      {children}
    </GenericDialog>
  );
}

interface DuplicateAssetProps {
  children: React.ReactNode;
  row: AssetRow;
}

export function DuplicateAsset({ children, row }: DuplicateAssetProps) {
  const { handleAction } = useHandleAction<AssetRow, unknown>();
  const [open, setOpen] = useState(false);

  return (
    <GenericDialog
      content={
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleAction("asset", "duplicate", row)}
          >
            Duplicate
          </AlertDialogAction>
        </AlertDialogFooter>
      }
      open={open}
      setOpen={setOpen}
      title="Confirm Duplication"
      description="The name will be updated to include “- Copy”, and the identifier will be left blank."
    >
      {children}
    </GenericDialog>
  );
}
