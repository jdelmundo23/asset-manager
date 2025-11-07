import { Check, ChevronsUpDown, X } from "lucide-react";
import { Input } from "../shadcn-ui/input";
import { Column, RowSelectionState } from "@tanstack/react-table";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../shadcn-ui/form";
import { cn } from "@/lib/utils";
import { Button } from "../shadcn-ui/button";
import { PopoverContent, PopoverTrigger } from "../shadcn-ui/popover";
import { Popover } from "@radix-ui/react-popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../shadcn-ui/command";
import CalendarPopover from "../fields/CalendarPopover";
import { AssetTableSheet } from "../fields/TableSheets";
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { ZodObject, ZodRawShape } from "zod";

interface EditorProps<T> {
  column: Column<T, unknown>;
  form: UseFormReturn;
  currentValue: unknown;
  schema?: ZodObject<ZodRawShape>;
}

export const TextEditor = <T,>({
  column,
  form,
  currentValue,
}: EditorProps<T>) => {
  return (
    <>
      <FormField
        control={form.control}
        name={column.id}
        render={({ field }) => (
          <FormItem className="relative flex w-60 flex-col bg-transparent">
            <div className="flex gap-x-1">
              <FormControl>
                <Input type="text" {...field} autoFocus />
              </FormControl>
              <button
                type="button"
                className="right-1 flex min-h-full items-center"
              >
                <X
                  className="hover:bg-muted cursor-pointer rounded-sm transition-colors"
                  onClick={() => form.setValue(column.id, "")}
                />
              </button>
            </div>
            {form.getValues(column.id) !== currentValue && (
              <Button className="h-8">Confirm Edit</Button>
            )}
            <FormMessage className="text-center" />
          </FormItem>
        )}
      />
    </>
  );
};

export const CostEditor = <T,>({
  column,
  form,
  currentValue,
}: EditorProps<T>) => {
  return (
    <FormField
      control={form.control}
      rules={{
        validate: (value) =>
          value !== Number(currentValue).toFixed(2) || "Please confirm edits",
      }}
      name={column.id}
      render={({ field }) => {
        const [localValue, setLocalValue] = useState(
          field.value !== null && field.value !== undefined
            ? Number(field.value).toFixed(2)
            : ""
        );
        return (
          <FormItem className="flex flex-col">
            <FormControl>
              <CurrencyInput
                autoFocus
                id="cost"
                placeholder="$0.00"
                decimalsLimit={2}
                prefix="$"
                className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={localValue}
                onValueChange={(value) => {
                  setLocalValue(value?.replace(/[^0-9.]/g, "") || "");
                }}
              />
            </FormControl>
            {localValue !== Number(currentValue).toFixed(2) && (
              <Button
                className="h-8"
                onClick={() => {
                  console.log(localValue);
                  console.log(currentValue);
                  field.onChange(localValue);
                  setLocalValue(Number(localValue).toFixed(2));
                }}
              >
                Confirm Edit
              </Button>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export const SelectEditor = <T,>({
  column,
  form,
  currentValue,
}: EditorProps<T>) => {
  return (
    <FormField
      control={form.control}
      name={column.id}
      render={({ field }) => {
        const [open, setOpen] = useState<boolean>(false);
        const options = column.columnDef.meta?.options ?? [];
        return (
          <FormItem className="flex flex-col">
            <Popover modal={true} open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    aria-label="Select option"
                    autoFocus
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-[200px] justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <p className="truncate">
                      {field.value
                        ? options.find((choice) => choice.ID === field.value)
                            ?.name
                        : `Select ${column.columnDef.header}`}
                    </p>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command className="">
                  <CommandInput placeholder={`Search...`} />
                  <CommandList>
                    <CommandEmpty>{`No results found.`}</CommandEmpty>
                    <CommandGroup>
                      {options.map((choice) => (
                        <CommandItem
                          value={choice.name}
                          key={choice.ID}
                          onSelect={async () => {
                            form.setValue(column.id, choice.ID);
                            await form.trigger(column.id);

                            if (field.value !== choice.ID) {
                              setTimeout(() => setOpen(false), 50);
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              choice.ID === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {choice.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {field.value !== currentValue && (
              <Button className="h-8">Confirm Edit</Button>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export const DateEditor = <T,>({
  column,
  form,
  currentValue,
}: EditorProps<T>) => {
  return (
    <FormField
      control={form.control}
      name={column.id}
      render={({ field }) => (
        <FormItem className="flex w-60 flex-col">
          <CalendarPopover
            autoFocus
            value={field.value === null ? undefined : field.value}
            onChange={field.onChange}
            placeHolder="Pick a date"
            width={240}
          />
          {+field.value !== +(currentValue as number) && (
            <Button className="h-8">Confirm Edit</Button>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const AssetSelector = <T,>({
  column,
  form,
  currentValue,
}: EditorProps<T>) => {
  return (
    <FormField
      control={form.control}
      name={column.id}
      render={({ field }) => {
        const [selectedRow, setSelectedRow] = useState<RowSelectionState>({
          [field.value ?? -1]: true,
        });
        return (
          <FormItem className="flex w-[200px] flex-col space-y-2">
            <FormControl>
              <AssetTableSheet
                value={field.value}
                selectedRow={selectedRow}
                setSelectedRow={setSelectedRow}
                onConfirm={() =>
                  field.onChange(parseInt(Object.keys(selectedRow)[0]))
                }
              />
            </FormControl>
            {field.value !== currentValue && (
              <Button className="h-8">Confirm Edit</Button>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
