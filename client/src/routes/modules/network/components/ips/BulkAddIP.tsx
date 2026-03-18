import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import BulkIPForm from "./BulkIPForm";

export default function BulkAddIP({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-h-screen max-w-3xl overflow-y-auto text-white">
        <div
          className="absolute right-3 top-3 cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <X className="text-muted-foreground h-6 w-6" />
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle>Bulk Add IP</AlertDialogTitle>
        </AlertDialogHeader>
        <BulkIPForm closeDialog={() => setOpen(false)} />
      </AlertDialogContent>
    </AlertDialog>
  );
}
