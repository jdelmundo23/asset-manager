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
import { Button } from "@/components/shadcn-ui/button";

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
      <AlertDialogContent className="flex flex-col justify-center gap-y-1">
        <AlertDialogTitle className="flex items-center justify-between text-white">
          {stageTitles[currentStage]}
          {currentStage === "upload" && (
            <a href="/api/import/template" download>
              <Button variant="secondary" size="sm" className="h-6 px-2">
                Download Template
              </Button>
            </a>
          )}
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
