import { Button } from "@/components/shadcn-ui/button";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { useImport } from "@/context/ImportContext";
import { Check, TriangleAlert } from "lucide-react";

interface ResultsStageProps {
  endImport: () => void;
}

export default function ResultsStage({ endImport }: ResultsStageProps) {
  const { importedCount, skippedRows } = useImport();
  return (
    <div className="flex w-full flex-col gap-y-2 font-medium text-white">
      <span className="flex items-center gap-x-1">
        <Check />
        {importedCount} {importedCount === 1 ? "asset" : "assets"} imported
      </span>

      {skippedRows.length > 0 ? (
        <div className="flex flex-col gap-y-1">
          <h2 className="flex gap-x-1 font-semibold">
            <TriangleAlert /> Rows Skipped
          </h2>
          <ScrollArea className="h-32 w-full rounded-sm border border-white py-1 text-sm">
            <ul>
              {skippedRows.map((row) => (
                <li
                  key={row.rowNumber}
                  className="grid grid-cols-[0.4fr_0.75fr_1.75fr] px-2"
                >
                  <p>Row {row.rowNumber}</p>
                  <p>{row.identifier}</p>
                  <p>{row.reason}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      ) : (
        <span className="flex items-center gap-x-1">
          <Check /> 0 rows skipped
        </span>
      )}

      <div className="flex justify-end">
        <Button variant={"secondary"} onClick={endImport}>
          Close
        </Button>
      </div>
    </div>
  );
}
