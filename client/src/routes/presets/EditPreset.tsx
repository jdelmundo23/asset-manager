import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil } from "lucide-react";
import PresetForm from "./PresetForm";
import { useContext, useState } from "react";
import PresetContext from "@/context/PresetContext";

interface EditPresetProps {
  presetName: string;
  presetType: string;
}

function EditPreset({ presetName, presetType }: EditPresetProps) {
  const { activePreset } = useContext(PresetContext);
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Pencil className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent className="dark">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{`Edit ${activePreset.displayName} Preset - ${presetName}`}</AlertDialogTitle>
        </AlertDialogHeader>
        <PresetForm
          operation="edit"
          oldPresetName={presetName}
          oldPresetType={presetType}
          closeDialog={() => setOpen(false)}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EditPreset;
