import { Button } from "@/components/shadcn-ui/button";
import { useImport } from "@/context/ImportContext";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { formatFileSize } from "@/lib/utils";
import { assetImportSchema, missingPresetsSchema } from "@shared/schemas";
import { useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import z from "zod";

interface UploadStageProps {
  nextStage: () => void;
  closeDialog: () => void;
}

export default function UploadStage({
  nextStage,
  closeDialog,
}: UploadStageProps) {
  const { setMissingPresets, setAssets } = useImport();
  const [file, setFile] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [failedMsg, setFailedMsg] = useState<string | null>();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setFailedMsg(null);
    }
  };

  const checkBulkImport = useMutation({
    mutationFn: (data: unknown) => {
      return axiosApi.post("/api/import/check", data);
    },
    onSuccess: (result) => {
      const missingPresets = missingPresetsSchema.safeParse(result.data);

      if (!missingPresets.error) {
        setMissingPresets(missingPresets.data);
        nextStage();
      } else {
        setFailedMsg("Failed to parse returned data");
      }
    },
  });

  const handleParsedData = async (data: unknown) => {
    const parse = z.array(assetImportSchema).safeParse(data);

    if (parse.error) {
      console.error(
        "Failed to parse CSV data. Ensure CSV is correctly formatted."
      );
      setFailedMsg("Invalid CSV format");
    } else {
      const seen = new Set<string>();
      const uniqueAssets = parse.data.filter((row) => {
        const key = `${row.Model}-${row.Identifier}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      toast
        .promise(checkBulkImport.mutateAsync(uniqueAssets), {
          loading: "Parsing rows...",
          success: "Successfully parsed rows",
        })
        .unwrap()
        .catch((err) => {
          setFailedMsg("Failed to parse CSV");
          handleError(err);
        });
      setAssets(uniqueAssets);
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <label htmlFor="upload">
        <div
          className={`flex h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-y-2 rounded-md border-2 ${file ? "border-solid" : "border-dashed"} relative text-white transition-colors duration-150 ease-in-out hover:border-solid hover:border-white ${failedMsg && "border-red-700"}`}
        >
          <Upload className="h-6 w-6" />
          <div className="flex flex-col items-center">
            <p className="text-center font-semibold">
              {file?.name || "Upload CSV"}
            </p>
            <p className="text-sm">
              {file && `(${formatFileSize(file.size)})`}
            </p>
          </div>
          <input
            ref={fileInputRef}
            id="upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </label>

      <div className="flex items-center justify-end gap-x-2">
        {failedMsg && <p className="font-medium text-red-700">{failedMsg}</p>}
        <Button
          variant={"secondary"}
          onClick={() => {
            if (file) {
              if (fileInputRef.current) fileInputRef.current.value = "";
              setFile(undefined);
              setFailedMsg(null);
            } else {
              closeDialog();
            }
          }}
        >
          {file ? "Clear" : "Cancel"}
        </Button>
        <Button
          disabled={!file}
          onClick={() => {
            if (file) {
              Papa.parse(file, {
                complete: async function (results) {
                  handleParsedData(results.data);
                },
                error: (error) => {
                  console.log(error);
                  setFailedMsg("Failed to parse CSV");
                },
                header: true,
                skipEmptyLines: true,
                dynamicTyping: false,
              });
            }
          }}
        >
          Parse
        </Button>
      </div>
    </div>
  );
}
