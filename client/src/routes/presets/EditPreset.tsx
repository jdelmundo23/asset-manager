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

interface EditPresetProps {
  preset: {
    displayName: string;
    tableName: string;
  };
  presetName: string;
  presetType: string;
  reloadData: () => void;
  typeData: [];
}

function EditPreset({
  preset,
  presetName,
  presetType,
  reloadData,
  typeData,
}: EditPresetProps) {
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
      <AlertDialogContent className="dark">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{`Edit ${preset.displayName} Preset - ${presetName}`}</AlertDialogTitle>
        </AlertDialogHeader>
        <PresetForm
          mode="edit"
          oldPresetName={presetName}
          oldPresetType={presetType}
          presetTable={preset.tableName}
          closeDialog={() => setOpen(false)}
          reloadData={reloadData}
          typeData={typeData}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EditPreset;
