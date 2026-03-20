import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/shadcn-ui/alert-dialog";
import { Button } from "@/components/shadcn-ui/button";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { TruncateHover } from "@/components/TruncateHover";
import { BulkResult } from "@shared/schemas";
import { Check, TriangleAlert } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface BulkSummaryProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  bulkResult: BulkResult | undefined;
  subnetPrefix: string | undefined;
  closeDialog: () => void;
}

export default function BulkSummary({
  open,
  setOpen,
  bulkResult,
  subnetPrefix,
  closeDialog,
}: BulkSummaryProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        {bulkResult && subnetPrefix ? (
          <div className="flex w-full flex-col gap-y-2 font-medium text-white">
            <span className="flex items-center gap-x-1">
              <Check />
              {bulkResult.inserted} {bulkResult.inserted === 1 ? "IP" : "IPs"}{" "}
              added
            </span>

            {bulkResult.skipped > 0 ? (
              <div className="flex flex-col gap-y-1">
                <h2 className="flex gap-x-1 font-semibold">
                  <TriangleAlert /> IPs Skipped (Existing)
                </h2>
                <ScrollArea className="h-32 w-full rounded-sm border border-white py-1 text-sm">
                  <ul>
                    {bulkResult.skippedRows.map((row) => (
                      <li
                        key={row.hostNumber}
                        className="grid grid-cols-[0.5fr_1.5fr_1fr] px-2"
                      >
                        <p>{subnetPrefix + "." + row.hostNumber}</p>
                        <TruncateHover>{row.name}</TruncateHover>
                        <p className="justify-self-end text-right">
                          {row.macAddress}
                        </p>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            ) : (
              <span className="flex items-center gap-x-1">
                <Check /> 0 IPs skipped
              </span>
            )}

            <div className="flex justify-end">
              <Button
                variant={"secondary"}
                onClick={() => {
                  setOpen(false);
                  closeDialog();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-white">Result not available or subnet missing</p>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setOpen(false);
                  closeDialog();
                }}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
