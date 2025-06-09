import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
import { useState } from "react";
import SubnetForm from "./SubnetForm";
import { X } from "lucide-react";

interface AddSubnetProps {
  children: JSX.Element;
  setSearch: (search: string) => void;
}

export default function AddSubnet({ children, setSearch }: AddSubnetProps) {
  const [formOpen, setFormOpen] = useState<boolean>(false);
  return (
    <AlertDialog open={formOpen} onOpenChange={setFormOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-h-screen overflow-y-auto sm:max-w-sm">
        <div
          className="absolute right-4 top-4 cursor-pointer text-white"
          onClick={() => setFormOpen(false)}
        >
          <X className="text-muted-foreground h-6 w-6" />
        </div>
        <SubnetForm
          mode="add"
          closeDialog={() => setFormOpen(false)}
          setSearch={setSearch}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
