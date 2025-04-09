import PresetContext from "@/context/PresetContext";
import { useContext } from "react";
import DeletePreset from "./DeletePreset";
import EditPreset from "./EditPreset";
import MissingAlert from "./MissingAlert";
import { Card } from "@/components/shadcn-ui/card";
import { Preset } from "@shared/schemas";

interface RowProps {
  row: Preset;
}

function Row({ row }: RowProps) {
  const { typeData, activePreset } = useContext(PresetContext);
  const type =
    (
      typeData.find((typeRow: Preset) => typeRow.ID === row.typeID) as
        | Preset
        | undefined
    )?.name || "";

  return (
    <div>
      <Card className="border-zinc-700 bg-zinc-100 px-2 py-1 font-semibold text-black">
        <div className="group flex items-center justify-between">
          <p
            title={row.name}
            className="w-5/6 max-w-[200px] truncate lg:max-w-[300px]"
          >
            {row.name}
            {activePreset.displayName === "Models" ? (
              <p className="text-sm font-medium">{type}</p>
            ) : (
              ""
            )}
          </p>
          <div className="relative flex items-center space-x-2">
            <div className="flex items-center space-x-2 opacity-0 transition-opacity ease-out group-hover:opacity-100">
              <EditPreset presetName={row.name} presetType={type} />
              <DeletePreset presetName={row.name} />
            </div>
            {activePreset.displayName === "Models" && !type ? (
              <MissingAlert message={"Missing asset type"} />
            ) : (
              ""
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Row;
