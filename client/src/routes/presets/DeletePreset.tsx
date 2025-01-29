import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { Trash2 } from "lucide-react";

interface DeletePresetProps {
  preset: {
    displayName: string;
    tableName: string;
  };
  presetName: string;
  reloadData: () => void;
}

function DeletePreset({ preset, presetName, reloadData }: DeletePresetProps) {
  async function onConfirm() {
    try {
      const response = await axios.delete(
        `/api/presets/${preset.tableName}/${presetName}`
      );
      console.log("Preset delete successfully", response.data);
      reloadData();
    } catch (error) {
      console.error("Delete failed", error);
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <button>
          <Trash2 className="h-4 w-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will delete{" "}
            <span className="font-semibold text-zinc-200">{presetName}</span>{" "}
            from the{" "}
            <span className="font-semibold text-zinc-200">
              {preset.displayName}
            </span>{" "}
            preset.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeletePreset;
