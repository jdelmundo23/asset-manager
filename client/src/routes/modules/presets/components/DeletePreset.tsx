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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";

interface DeletePresetProps {
  presetName: string;
}

const deletePresetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tableName,
      presetName,
    }: {
      tableName: string;
      presetName: string;
    }) => {
      return axiosApi.delete(`/api/presets/${tableName}/${presetName}`);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["preset", variables.tableName],
      });

      if (variables.tableName === "assetmodels") {
        queryClient.invalidateQueries({ queryKey: ["types"] });
      }
    },
  });
};

function DeletePreset({ presetName }: DeletePresetProps) {
  const { activePreset } = useContext(PresetContext);
  const [open, setOpen] = useState(false);
  const mutation = deletePresetMutation();

  async function onConfirm() {
    const variables = {
      tableName: activePreset.tableName,
      presetName,
    };

    toast
      .promise(
        mutation.mutateAsync(variables).then(() => setOpen(false)),
        {
          loading: "Deleting preset...",
          success: `Preset deleted!`,
        }
      )
      .unwrap()
      .catch((err) => {
        handleError(err);
      });
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeletePreset;
