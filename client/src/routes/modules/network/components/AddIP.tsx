import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
import { Button } from "@/components/shadcn-ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import IPForm from "./IPForm";

export default function AddIP() {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Button variant={"secondary"}>Add IP</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-screen overflow-y-auto sm:max-w-2xl">
        <div
          className="absolute right-4 top-4 cursor-pointer text-white"
          onClick={() => setOpen(false)}
        >
          <X className="text-muted-foreground h-6 w-6" />
        </div>
        <IPForm mode="add" closeDialog={() => setOpen(false)} />
      </AlertDialogContent>
    </AlertDialog>
  );
}
