import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
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

export default function FileUpload({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentStage, setCurrentStage] = useState<Stage>("upload");
  const [open, setOpen] = useState<boolean>(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
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
