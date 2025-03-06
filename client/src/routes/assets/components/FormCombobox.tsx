import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Asset } from "@/types";
import { cn } from "@/lib/utils";

interface FormComboboxProps<
  T extends keyof Asset,
  C extends Record<L, string>,
  V extends keyof C,
  L extends keyof C,
> {
  form: UseFormReturn<Asset>;
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
  onSelect: (val: Asset[T], fieldName: T, newVal: C) => void;
  className?: string;
}
function FormCombobox<
  T extends keyof Asset,
  C extends Record<L, string>,
  V extends keyof C,
  L extends keyof C,
>(props: FormComboboxProps<T, C, V, L>) {
  const { items, valueKey, labelKey } = props.choices;
  return (
    <FormField
      control={props.form.control}
      name={props.options.field}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{props.options.fieldLabel}</FormLabel>
          <Popover modal={true}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-[200px] justify-between",
                    !field.value && "text-muted-foreground",
                    props.className
                  )}
                >
                  {field.value
                    ? items.find(
                        (choice) => choice[valueKey] === field.value
                      )?.[labelKey]
                    : `Select ${props.options.msgLabel}`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command className="dark">
                <CommandInput
                  placeholder={`Search ${props.options.msgLabel}...`}
                />
                <CommandList>
                  <CommandEmpty>{`No ${props.options.msgLabel} found.`}</CommandEmpty>
                  <CommandGroup>
                    {items.map((choice) => (
                      <CommandItem
                        value={choice[labelKey]}
                        key={choice[valueKey]}
                        onSelect={async () => {
                          props.onSelect(
                            field.value,
                            props.options.field,
                            choice
                          );
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
                        {choice[labelKey]}
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
