import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import PresetForm from "./PresetForm";

interface AddPresetProps {
  presetType: string;
}

function AddPreset({ presetType }: AddPresetProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <button className="w-full">
          <Card className="flex justify-center border-zinc-700 bg-zinc-800 px-2 py-1 transition-colors duration-150 ease-out hover:border-zinc-300">
            <Plus />
          </Card>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{`Add ${presetType} Preset`}</AlertDialogTitle>
        </AlertDialogHeader>
        <PresetForm />
        <AlertDialogFooter>
          <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AddPreset;
