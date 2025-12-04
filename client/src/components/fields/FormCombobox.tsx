import { Button } from "@/components/shadcn-ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn-ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { FieldPathValue, Path, UseFormReturn } from "react-hook-form";
import { Asset, Preset, Subnet } from "@shared/schemas";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TruncateHover } from "../TruncateHover";

type SupportedFormType = Asset | Subnet | Preset;

interface FormComboboxProps<
  S extends SupportedFormType,
  T extends Path<S>,
  C extends Record<L, string>,
  V extends keyof C,
  L extends keyof C,
> {
  form: UseFormReturn<S>;
  options: {
    field: T;
    fieldLabel: string;
    msgLabel: string;
  };
  choices: {
    items: C[];
    valueKey: V;
    labelKey: L;
  };
  onSelect: (val: FieldPathValue<S, T>, fieldName: T, newVal: C) => void;
  className?: string;
  disabled?: boolean;
}

function FormCombobox<
  S extends SupportedFormType,
  T extends Path<S>,
  C extends Record<L, string>,
  V extends keyof C,
  L extends keyof C,
>(props: FormComboboxProps<S, T, C, V, L>) {
  const { items, valueKey, labelKey } = props.choices;
  const [open, setOpen] = useState<boolean>(false);

  return (
    <FormField
      control={props.form.control}
      name={props.options.field}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{props.options.fieldLabel}</FormLabel>
          <Popover modal={true} open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={props.disabled}
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-[200px] justify-between",
                    !field.value && "text-muted-foreground",
                    props.className
                  )}
                >
                  <TruncateHover>
                    {String(
                      field.value
                        ? (items.find(
                            (choice) => choice[valueKey] === field.value
                          )?.[labelKey] ?? "")
                        : `Select ${props.options.msgLabel}`
                    )}
                  </TruncateHover>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command className="">
                <CommandInput
                  placeholder={`Search ${props.options.msgLabel}...`}
                />
                <CommandList>
                  <CommandEmpty>{`No ${props.options.msgLabel} found.`}</CommandEmpty>
                  <CommandGroup>
                    {items?.map((choice) => (
                      <CommandItem
                        value={choice[labelKey]}
                        key={choice[valueKey]}
                        onSelect={async () => {
                          props.onSelect(
                            field.value,
                            props.options.field,
                            choice
                          );
                          if (field.value !== choice[valueKey]) {
                            setTimeout(() => setOpen(false), 75);
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            choice[valueKey] === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <TruncateHover>{choice[labelKey]}</TruncateHover>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormCombobox;
