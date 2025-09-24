import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
import { Button } from "@/components/shadcn-ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import UploadStage from "./import_stages/UploadStage";
import { ImportProvider } from "@/context/ImportContext";
import PreviewStage from "./import_stages/PreviewStage";

type Stage = "upload" | "preview" | "confirm" | "results";

const stageTitles: Record<Stage, string> = {
  upload: "Import Assets",
  preview: "Required Presets",
  confirm: "Confirm Submission",
  results: "View Results",
};

export default function FileUpload() {
  const [currentStage, setCurrentStage] = useState<Stage>("upload");
  const [open, setOpen] = useState<boolean>(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Button variant={"secondary"} className="gap-x-1.5">
          Import
          <Upload />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col justify-center">
        <AlertDialogTitle className="text-white">
          {stageTitles[currentStage]}
        </AlertDialogTitle>
        <ImportProvider>
          {currentStage === "upload" && (
            <UploadStage
              nextStage={() => {
                setCurrentStage("preview");
              }}
              closeDialog={() => setOpen(false)}
            />
          )}
          {currentStage === "preview" && (
            <PreviewStage previousStage={() => setCurrentStage("upload")} />
          )}
        </ImportProvider>
      </AlertDialogContent>
    </AlertDialog>
  );
}
