import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/shadcn-ui/alert-dialog";
import IPForm from "./IPForm";
import { X } from "lucide-react";
import { IPRow } from "@shared/schemas";

interface EditIPProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  ip: IPRow;
}

function EditIP({ open, setOpen, ip }: EditIPProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-h-screen overflow-y-auto sm:max-w-2xl">
        <div
          className="absolute right-4 top-4 cursor-pointer text-white"
          onClick={() => setOpen(false)}
        >
          <X className="text-muted-foreground h-6 w-6" />
        </div>
        <IPForm mode="edit" closeDialog={() => setOpen(false)} ip={ip} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EditIP;
