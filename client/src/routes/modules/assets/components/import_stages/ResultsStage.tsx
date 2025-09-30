import { Button } from "@/components/shadcn-ui/button";
import { useImport } from "@/context/ImportContext";
import { Check, TriangleAlert } from "lucide-react";

interface ResultsStageProps {
  endImport: () => void;
}

export default function ResultsStage({ endImport }: ResultsStageProps) {
  const { importedCount, skippedCount } = useImport();
  return (
    <div className="flex w-full flex-col gap-y-2 font-medium text-white">
      <span className="flex items-center gap-x-1">
        <Check />
        {importedCount} {importedCount === 1 ? "asset" : "assets"} imported
      </span>
      <span className="flex items-center gap-x-1">
        <TriangleAlert />
        {skippedCount} duplicate/existing
        {skippedCount === 1 ? " asset" : " assets"} skipped
      </span>
      <div className="flex justify-end">
        <Button variant={"secondary"} onClick={endImport}>
          Close
        </Button>
      </div>
    </div>
  );
}
