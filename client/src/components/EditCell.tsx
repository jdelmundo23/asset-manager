import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { Check, ChevronsUpDown, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Input } from "./shadcn-ui/input";
import { Column, RowSelectionState } from "@tanstack/react-table";
import { z, ZodObject, ZodRawShape } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "./shadcn-ui/form";
import { cn } from "@/lib/utils";
import { Button } from "./shadcn-ui/button";
import { PopoverContent, PopoverTrigger } from "./shadcn-ui/popover";
import { Popover } from "@radix-ui/react-popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./shadcn-ui/command";
import CalendarPopover from "./CalendarPopover";
import { AssetTableSheet } from "./TableSheets";

export const EditCell = <T,>({
  column,
  currentValue,
  schema,
}: {
  column: Column<T, unknown>;
  currentValue: unknown;
  schema: ZodObject<ZodRawShape>;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const cellOnlySchema = schema.pick({ [column.id]: true });
  type CellType = z.infer<typeof cellOnlySchema>;

  const form = useForm<CellType>({
    resolver: zodResolver(cellOnlySchema),
    defaultValues: { [column.id]: currentValue },
  });

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (isOpen) {
      form.reset();
    }
  };

  async function onSubmit(values: CellType) {
    if (values[column.id] !== currentValue) {
      console.log(values[column.id]);
    }
  }

  let editField: JSX.Element = <></>;

  if (!column.columnDef.meta?.editTable) {
    switch (column.columnDef.meta?.type) {
      case "text":
        editField = (
          <TextEditor column={column} form={form} currentValue={currentValue} />
        );
        break;
      case "select":
        editField = (
          <SelectEditor
            column={column}
            form={form}
            currentValue={currentValue}
          />
        );
        break;
      case "date":
        editField = (
          <DateEditor column={column} form={form} currentValue={currentValue} />
        );
        break;
    }
  } else {
    switch (column.columnDef.meta?.editTable) {
      case "assets":
        editField = (
          <AssetSelector
            column={column}
            form={form}
            currentValue={currentValue}
          />
        );
        break;
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger>
        <Pencil
          className={`h-4 w-4 cursor-pointer opacity-0 transition-opacity duration-100 group-first:hidden group-last:hidden group-hover:opacity-100 ${isOpen && "opacity-100"}`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>{editField}</form>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TextEditor = <T,>({
  column,
  form,
  currentValue,
}: {
  column: Column<T, unknown>;
  form: UseFormReturn;
  currentValue: unknown;
}) => {
  return (
    <FormField
      control={form.control}
      name={column.id}
      render={({ field }) => (
        <FormItem className="relative flex w-60 flex-col bg-transparent">
          <FormControl>
            <Input type="text" {...field} autoFocus />
          </FormControl>
          <X
            className="hover:bg-muted absolute right-1 top-1.5 flex cursor-pointer rounded-sm transition-colors"
            style={{ marginTop: 0 }}
            onClick={() => form.setValue(column.id, "")}
          />
          {field.value !== currentValue && (
            <Button className="h-8">Confirm Edit</Button>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const SelectEditor = <T,>({
  column,
  form,
  currentValue,
}: {
  column: Column<T, unknown>;
  form: UseFormReturn;
  currentValue: unknown;
}) => {
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
                        : `Select option`}
                    </p>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command className="dark">
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

const DateEditor = <T,>({
  column,
  form,
  currentValue,
}: {
  column: Column<T, unknown>;
  form: UseFormReturn;
  currentValue: unknown;
}) => {
  return (
    <FormField
      control={form.control}
      name={column.id}
      render={({ field }) => (
        <FormItem className="flex w-60 flex-col">
          <CalendarPopover
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

const AssetSelector = <T,>({
  column,
  form,
  currentValue,
}: {
  column: Column<T, unknown>;
  form: UseFormReturn;
  currentValue: unknown;
}) => {
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
