import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
import { Button } from "@/components/shadcn-ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import UploadStage from "./import_stages/UploadStage";
import { ImportProvider } from "@/context/ImportContext";
import PreviewStage from "./import_stages/PreviewStage";

type Stage = "upload" | "preview" | "confirm" | "results";

export default function FileUpload() {
  const [currentStage, setCurrentStage] = useState<Stage>("upload");

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant={"secondary"} className="gap-x-1.5">
          Import
          <Upload />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="flex justify-center">
        <ImportProvider>
          {currentStage === "upload" && (
            <UploadStage
              nextStage={() => {
                setCurrentStage("preview");
              }}
            />
          )}
          {currentStage === "preview" && <PreviewStage />}
        </ImportProvider>
      </AlertDialogContent>
    </AlertDialog>
  );
}
