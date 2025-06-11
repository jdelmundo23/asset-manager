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
} from "@/components/shadcn-ui/alert-dialog";
import PresetContext from "@/context/PresetContext";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { Trash2 } from "lucide-react";
import { useContext } from "react";

interface DeletePresetProps {
  presetName: string;
}

function DeletePreset({ presetName }: DeletePresetProps) {
  const { reloadData, activePreset } = useContext(PresetContext);

  async function onConfirm() {
    try {
      await axiosApi.delete(
        `/api/presets/${activePreset.tableName}/${presetName}`
      );

      reloadData();
    } catch (error) {
      handleError(error);
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent className="">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will delete{" "}
            <span className="font-semibold text-zinc-200">{presetName}</span>{" "}
            from the{" "}
            <span className="font-semibold text-zinc-200">
              {activePreset.displayName}
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
