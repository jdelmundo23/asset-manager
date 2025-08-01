import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
import { Pencil } from "lucide-react";
import PresetForm from "./PresetForm";
import { useContext, useState } from "react";
import PresetContext from "@/context/PresetContext";
import { PresetRow } from "@shared/schemas";

interface EditPresetProps {
  preset: PresetRow;
}

function EditPreset({ preset }: EditPresetProps) {
  const { activePreset } = useContext(PresetContext);
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Pencil className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent className="">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{`Edit ${activePreset.displayName} Preset - ${preset.name}`}</AlertDialogTitle>
        </AlertDialogHeader>
        <PresetForm
          mode="edit"
          preset={preset}
          closeDialog={() => setOpen(false)}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EditPreset;
