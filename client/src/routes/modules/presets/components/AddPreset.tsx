import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
import { Card } from "@/components/shadcn-ui/card";
import { Plus } from "lucide-react";
import PresetForm from "./PresetForm";
import { useContext, useState } from "react";
import PresetContext from "@/context/PresetContext";

function AddPreset() {
  const { activePreset } = useContext(PresetContext);
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <button className="w-full">
          <Card className="flex justify-center border-zinc-700 bg-zinc-800 px-2 py-1 transition-colors duration-150 ease-out hover:border-zinc-300">
            <Plus />
          </Card>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{`Add ${activePreset.displayName} Preset`}</AlertDialogTitle>
        </AlertDialogHeader>
        <PresetForm operation="add" closeDialog={() => setOpen(false)} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AddPreset;
