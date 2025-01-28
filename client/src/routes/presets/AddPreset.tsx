import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import PresetForm from "./PresetForm";
import { useState } from "react";

interface AddPresetProps {
  preset: {
    displayName: string;
    tableName: string;
  };
  reloadData: () => void;
}

function AddPreset({ preset, reloadData }: AddPresetProps) {
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
          <AlertDialogTitle className="text-white">{`Add ${preset.displayName} Preset`}</AlertDialogTitle>
        </AlertDialogHeader>
        <PresetForm
          presetTable={preset.tableName}
          closeDialog={() => setOpen(false)}
          reloadData={reloadData}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AddPreset;
