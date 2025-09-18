import { Button } from "@/components/shadcn-ui/button";
import { useImport } from "@/context/ImportContext";
import axiosApi from "@/lib/axios";
import { assetImportSchema, missingPresetsSchema } from "@shared/schemas";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { ChangeEvent, useState } from "react";
import z from "zod";

interface UploadStageProps {
  nextStage: () => void;
}

export default function UploadStage({ nextStage }: UploadStageProps) {
  const { setMissingPresets } = useImport();
  const [file, setFile] = useState<File>();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <label htmlFor="upload">
      <div className="flex h-[150px] w-[300px] flex-col items-center justify-center rounded-md border-2 border-dashed text-white">
        <Upload className="h-6 w-6" />
        <p className="font-semibold">Upload CSV</p>
        <input
          id="upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <p>{file?.name}</p>
        <Button
          disabled={!file}
          onClick={() => {
            if (file) {
              Papa.parse(file, {
                complete: async function (results) {
                  const parse = z
                    .array(assetImportSchema)
                    .safeParse(results.data);

                  if (parse.error) {
                    console.log("Failed to parse" + parse.error);
                  } else {
                    const response = await axiosApi.post(
                      "/api/assets/bulk/import/check",
                      parse.data
                    );
                    const missingPresets = missingPresetsSchema.safeParse(
                      response.data
                    );
                    if (!missingPresets.error) {
                      setMissingPresets(missingPresets.data);
                      nextStage();
                    }
                  }
                },
                header: true,
                skipEmptyLines: true,
              });
            }
          }}
        >
          Parse
        </Button>
      </div>
    </label>
  );
}
