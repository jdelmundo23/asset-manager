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
import { useState } from "react";
import CalendarPopover from "@/components/CalendarPopover";

const TextFilter = <T,>({ column }: { column: Column<T, unknown> }) => {
  return (
    <>
      <Input
        placeholder={`Filter by ${column.columnDef.header}`}
        value={(column?.getFilterValue() as string) ?? ""}
        onChange={(event) => column.setFilterValue(event.target.value)}
      />
      {column.getFilterValue() && (
        <X
          className="absolute inset-y-2 right-1 cursor-pointer rounded-sm text-zinc-300 hover:bg-zinc-700"
          onClick={() => column.setFilterValue("")}
        />
      )}
    </>
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
  const [from, setFrom] = useState<Date | undefined>(current?.[0]);
  const [to, setTo] = useState<Date | undefined>(current?.[1]);

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <div className="flex w-full flex-col gap-y-2">
        <div>
          <label className="ml-0.5 text-sm">From:</label>
          <CalendarPopover
            value={from}
            onChange={setFrom}
            placeHolder="Pick a date"
          />
        </div>
        <div>
          <label className="ml-0.5 text-sm">To:</label>
          <CalendarPopover
            value={to}
            onChange={setTo}
            placeHolder="Pick a date"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button
          variant={"link"}
          className="p-2 text-xs"
          onClick={() => {
            setFrom(undefined);
            setTo(undefined);
            column.setFilterValue(undefined);
          }}
        >
          Clear filter
        </Button>
        <Button
          className="h-8"
          onClick={() => {
            if ([from, to].every((item) => item === undefined)) {
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

export const FilterBox = <T,>({
  type,
  column,
  children,
}: {
  type: "text" | "select" | "date";
  column: Column<T, unknown>;
  children: React.ReactNode;
}) => {
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
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="dark rounded-xl p-0"
      >
        {filterElement}
      </PopoverContent>
    </Popover>
  );
};
