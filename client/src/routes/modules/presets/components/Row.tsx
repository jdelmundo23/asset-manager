import PresetContext from "@/context/PresetContext";
import { useContext } from "react";
import DeletePreset from "./DeletePreset";
import EditPreset from "./EditPreset";
import MissingAlert from "./MissingAlert";
import { Card } from "@/components/shadcn-ui/card";
import { PresetRow } from "@shared/schemas";

interface RowProps {
  preset: PresetRow;
}

function Row({ preset }: RowProps) {
  const { activePreset } = useContext(PresetContext);

  return (
    <div>
      <Card className="bg-foreground border-muted px-2 py-1 font-semibold text-black">
        <div className="group flex items-center justify-between">
          <p
            title={preset.name}
            className="w-5/6 max-w-[200px] truncate lg:max-w-[300px]"
          >
            {preset.name}
            {preset.typeName ? (
              <p className="text-sm font-medium">{preset.typeName}</p>
            ) : (
              ""
            )}
          </p>
          <div className="relative flex items-center space-x-2">
            <div className="flex items-center space-x-2 opacity-0 transition-opacity ease-out group-hover:opacity-100">
              <EditPreset preset={preset} />
              <DeletePreset preset={preset} />
            </div>
            {activePreset.displayName === "Models" && !preset.typeID ? (
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
