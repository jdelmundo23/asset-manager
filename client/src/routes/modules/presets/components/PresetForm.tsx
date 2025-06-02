import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { Button } from "@/components/shadcn-ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn-ui/command";
import { useContext, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn-ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import PresetContext from "@/context/PresetContext";
import { Preset } from "@shared/schemas";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";

interface PresetFormProps {
  operation: "add" | "edit";
  oldPresetName?: string;
  oldPresetType?: string;
  closeDialog: () => void;
}

const formSchema = z.object({
  presetName: z.string().min(2).max(50),
  presetType: z.string().optional(),
});

async function handlePreset(
  operation: "add" | "edit",
  mode: "common" | "model",
  table: string,
  name: string,
  oldName?: string,
  type?: string
) {
  const url =
    mode === "common" ? `/api/presets/${table}` : `/api/presets/assetmodels`;
  const method = operation === "add" ? "post" : "put";
  const data = mode === "common" ? { name, oldName } : { name, type, oldName };

  console.log(data);
  const response = await axiosApi[method](url, data);
  console.log(`Preset operation successful`, response.data);
}

export default function PresetForm({
  operation,
  oldPresetName,
  oldPresetType,
  closeDialog,
}: PresetFormProps) {
  const { reloadData, typeData, activePreset } = useContext(PresetContext);

  const [msg, setMsg] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { presetName: oldPresetName, presetType: oldPresetType },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (activePreset.tableName === "assetmodels" && values.presetType) {
        if (operation === "edit" && oldPresetName) {
          await handlePreset(
            "edit",
            "model",
            "assetModels",
            values.presetName,
            oldPresetName,
            values.presetType
          );
        } else {
          await handlePreset(
            "add",
            "model",
            "assetModels",
            values.presetName,
            "",
            values.presetType
          );
        }
      } else {
        if (operation === "edit" && oldPresetName) {
          await handlePreset(
            "edit",
            "common",
            activePreset.tableName,
            values.presetName,
            oldPresetName
          );
        } else {
          await handlePreset(
            "add",
            "common",
            activePreset.tableName,
            values.presetName
          );
        }
      }
      closeDialog();
      reloadData();
    } catch (error) {
      const errorMsg = handleError(error);
      setMsg(errorMsg);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto flex w-full flex-col space-y-4"
      >
        <FormField
          control={form.control}
          name="presetName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Name"
                  defaultValue={oldPresetName}
                  type="text"
                  {...field}
                  className="w-full text-white"
                  onChange={(e) => {
                    setMsg("");
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage>{msg}</FormMessage>
            </FormItem>
          )}
        />
        {typeData.length > 0 ? (
          <FormField
            control={form.control}
            name="presetType"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Type</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[200px] justify-between text-white",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value || "Select an asset type"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command className="">
                      <CommandInput placeholder="Search asset type..." />
                      <CommandList>
                        <CommandEmpty>No asset type found.</CommandEmpty>
                        <CommandGroup>
                          {typeData.map((type: Preset) => (
                            <CommandItem
                              value={type.name}
                              key={type.name}
                              onSelect={() => {
                                form.setValue("presetType", type.name);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  type.name === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {type.name}
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
        ) : (
          ""
        )}
        <div className="flex flex-col-reverse justify-end space-y-2 space-y-reverse sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button
            variant="outline"
            className="text-white"
            onClick={(e) => {
              e.preventDefault();
              closeDialog();
            }}
          >
            Cancel
          </Button>
          <Button type="submit">Confirm</Button>
        </div>
      </form>
    </Form>
  );
}
