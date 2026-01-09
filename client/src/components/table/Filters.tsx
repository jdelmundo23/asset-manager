import { Input } from "@/components/shadcn-ui/input";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/shadcn-ui/multi-select";
import { Button } from "@/components/shadcn-ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import { Column } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CalendarPopover from "../fields/CalendarPopover";
import { Checkbox } from "../shadcn-ui/checkbox";
import { Label } from "../shadcn-ui/label";
import { CheckedState } from "@radix-ui/react-checkbox";

export const FilterBox = <T,>({
  type,
  column,
  children,
}: {
  type: "text" | "select" | "date" | "cost";
  column: Column<T, unknown>;
  children: React.ReactNode;
}) => {
  if (type === "cost") return <div></div>;

  let filterElement: JSX.Element = <></>;

  switch (type) {
    case "text":
      filterElement = <TextFilter column={column} />;
      break;
    case "select":
      filterElement = <SelectFilter column={column} />;
      break;
    case "date":
      filterElement = <DateFilter column={column} />;
      break;
  }
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="rounded-xl p-0">
        {filterElement}
      </PopoverContent>
    </Popover>
  );
};

const TextFilter = <T,>({ column }: { column: Column<T, unknown> }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState<CheckedState>();

  useEffect(() => {
    if (column.getFilterValue() === "(blank)") {
      setChecked(true);
    }
  }, []);

  return (
    <div className="flex flex-col gap-y-2 p-2">
      <Input
        disabled={checked === true}
        ref={inputRef}
        placeholder={`Filter by ${column.columnDef.header}`}
        value={(column?.getFilterValue() as string) ?? ""}
        onChange={(event) => column.setFilterValue(event.target.value)}
        autoFocus
      />
      {column.getFilterValue() && !checked ? (
        <button
          aria-label="Clear text filter"
          className="absolute inset-y-4 right-3 flex"
          onClick={() => {
            column.setFilterValue("");
            inputRef.current?.focus();
          }}
        >
          <X className="text-muted-foreground hover:text-white" />
        </button>
      ) : (
        <></>
      )}
      <div className="flex items-center gap-3">
        <Checkbox
          id={`missing-${column.columnDef.id}`}
          checked={checked}
          onCheckedChange={(checked) => {
            column.setFilterValue(checked === true ? "(blank)" : "");
            setChecked(checked);
          }}
        />
        <Label htmlFor={`missing-${column.columnDef.id}`}>Show blank</Label>
      </div>
    </div>
  );
};

const SelectFilter = <T,>({ column }: { column: Column<T, unknown> }) => {
  return (
    <MultiSelector
      values={(column.getFilterValue() as string[]) ?? []}
      onValuesChange={(value) => {
        if (value.length <= 0) {
          column.setFilterValue(undefined);
        } else {
          column.setFilterValue(value);
        }
      }}
      loop
      className="space-y-0"
    >
      <MultiSelectorTrigger>
        <MultiSelectorInput
          className=""
          placeholder={`Filter by ${column.columnDef.header}`}
        />
      </MultiSelectorTrigger>
      <MultiSelectorContent>
        <MultiSelectorList className="mt-0.5">
          <MultiSelectorItem key={"(blank)"} value={"(blank)"}>
            {`(blank)`}
          </MultiSelectorItem>
          {column.columnDef.meta?.options?.map((value) => (
            <MultiSelectorItem key={value.ID} value={value.name}>
              {`${value.name}`}
            </MultiSelectorItem>
          ))}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelector>
  );
};

const DateFilter = <T,>({ column }: { column: Column<T, unknown> }) => {
  const current = column.getFilterValue() as [
    Date | undefined,
    Date | undefined,
  ];
  const [from, setFrom] = useState<Date | undefined | null>(current?.[0]);
  const [to, setTo] = useState<Date | undefined | null>(current?.[1]);
  const [checked, setChecked] = useState<CheckedState>();

  useEffect(() => {
    if (column.getFilterValue() === null) {
      setChecked(true);
    }
  }, []);

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <div className="flex w-full flex-col gap-y-2">
        <div>
          <label className="ml-0.5 text-sm">From:</label>
          <CalendarPopover
            disabled={checked === true}
            value={from ?? undefined}
            onChange={setFrom}
            placeHolder="Pick a date"
          />
        </div>
        <div>
          <label className="ml-0.5 text-sm">To:</label>
          <CalendarPopover
            disabled={checked === true}
            value={to ?? undefined}
            onChange={setTo}
            placeHolder="Pick a date"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            id={`missing-${column.columnDef.id}`}
            checked={checked}
            onCheckedChange={(checked) => {
              column.setFilterValue(checked === true ? null : undefined);
              setChecked(checked);
              setFrom(undefined);
              setTo(undefined);
            }}
          />
          <Label htmlFor={`missing-${column.columnDef.id}`}>Show blank</Label>
        </div>
        <Button
          className="h-8"
          onClick={() => {
            if ([from, to].every((item) => item == null)) {
              column.setFilterValue(undefined);
            } else {
              column.setFilterValue([from, to]);
            }
          }}
        >
          Filter
        </Button>
      </div>
    </div>
  );
};
