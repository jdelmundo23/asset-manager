import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil } from "lucide-react";
import PresetForm from "./PresetForm";
import { useState } from "react";

interface AddPresetProps {
  preset: {
    displayName: string;
    tableName: string;
  };
  presetName: string;
  reloadData: () => void;
}

function AddPreset({ preset, presetName, reloadData }: AddPresetProps) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <AlertDialogTrigger>
          <button>
            <Pencil className="h-4 w-4" />
          </button>
        </AlertDialogTrigger>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{`Edit ${preset.displayName} Preset - ${presetName}`}</AlertDialogTitle>
        </AlertDialogHeader>
        <PresetForm
          mode="edit"
          oldPresetName={presetName}
          presetTable={preset.tableName}
          closeDialog={() => setOpen(false)}
          reloadData={reloadData}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AddPreset;
