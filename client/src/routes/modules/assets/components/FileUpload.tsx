import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/shadcn-ui/alert-dialog";
import { Button } from "@/components/shadcn-ui/button";
import { assetImportSchema } from "@shared/schemas";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { ChangeEvent, useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File>();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant={"secondary"} className="gap-x-1.5">
          Import
          <Upload />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="flex justify-center">
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
                    complete: function (results) {
                      const parse = assetImportSchema.safeParse(
                        results.data[0]
                      );
                      if (parse.error) {
                        console.log("Failed to parse" + parse.error);
                      }
                      console.log(parse.data);
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
      </AlertDialogContent>
    </AlertDialog>
  );
}
