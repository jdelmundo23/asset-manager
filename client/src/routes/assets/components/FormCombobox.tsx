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
import { Asset, Preset } from "@/types";
import { cn } from "@/lib/utils";

interface FormComboboxProps<T extends keyof Asset> {
  form: UseFormReturn<Asset>;
  options: {
    field: T;
    label: string;
    msgLabel: string;
  };
  choices: Preset[];
  type: "indepenent" | "parent" | "child" | "custom";
  onSelect: (
    val: Asset[keyof Asset],
    name: keyof Asset,
    newVal: Asset[keyof Asset]
  ) => void;
}

function FormCombobox<T extends keyof Asset>({
  form,
  options,
  choices,
  type,
  onSelect,
}: FormComboboxProps<T>) {
  return (
    <div className="col-span-6">
      <FormField
        control={form.control}
        name={options.field}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{options.label}</FormLabel>
            <Popover>
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
                    {field.value
                      ? choices.find((choice) => choice.ID === field.value)
                          ?.name
                      : `Select ${options.msgLabel}`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command className="dark">
                  <CommandInput placeholder={`Search ${options.msgLabel}...`} />
                  <CommandList>
                    <CommandEmpty>{`No ${options.msgLabel} found.`}</CommandEmpty>
                    <CommandGroup>
                      {choices.map((choice) => (
                        <CommandItem
                          value={choice.name}
                          key={choice.ID}
                          onSelect={async () => {
                            switch (type) {
                              case "indepenent": {
                                onSelect(field.value, options.field, choice.ID);
                              }
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

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default FormCombobox;
