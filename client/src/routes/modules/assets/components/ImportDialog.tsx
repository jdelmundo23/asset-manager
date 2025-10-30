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
import ResultsStage from "./import_stages/ResultsStage";

type Stage = "upload" | "preview" | "results";

const stageTitles: Record<Stage, string> = {
  upload: "Import Assets",
  preview: "Required Presets",
  results: "Import Results",
};

export default function FileUpload() {
  const [currentStage, setCurrentStage] = useState<Stage>("upload");
  const [open, setOpen] = useState<boolean>(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Button variant={"secondary"} className="gap-x-1.5">
          Import
          <Upload className="hidden sm:block" />
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
            <PreviewStage
              previousStage={() => setCurrentStage("upload")}
              nextStage={() => setCurrentStage("results")}
            />
          )}
          {currentStage === "results" && (
            <ResultsStage
              endImport={() => {
                setOpen(false);
                setTimeout(() => setCurrentStage("upload"), 200);
              }}
            />
          )}
        </ImportProvider>
      </AlertDialogContent>
    </AlertDialog>
  );
}
