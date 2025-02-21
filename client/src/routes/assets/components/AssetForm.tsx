"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import CurrencyInput from "react-currency-input-field";
import AssetContext from "@/context/AssetContext";
import { useContext } from "react";
import { Preset } from "@/types";

interface AssetFormProps {
  closeDialog: () => void;
}

const formSchema = z.object({
  asset_name: z.string().min(2).max(100),
  identifier: z.string().min(2).max(100),
  typeID: z.number(),
  modelID: z.number(),
  locationID: z.number(),
  departmentID: z.number(),
  assignedTo: z.string(),
  purchaseDate: z.coerce.date(),
  warrantyDate: z.coerce.date().optional(),
  ipAddress: z.string().ip().optional(),
  macAddress: z
    .string()
    .regex(
      /^(?:[0-9A-Fa-f]{2}([-:])(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}|[0-9A-Fa-f]{12})$/,
      "Invalid MAC address format"
    )
    .optional(),
  cost: z.number(),
});

export default function AssetForm({ closeDialog }: AssetFormProps) {
  const { types, models, locations, departments } = useContext(AssetContext);
  const languages = [
    {
      label: "English",
      value: "en",
    },
    {
      label: "French",
      value: "fr",
    },
    {
      label: "German",
      value: "de",
    },
    {
      label: "Spanish",
      value: "es",
    },
    {
      label: "Portuguese",
      value: "pt",
    },
    {
      label: "Russian",
      value: "ru",
    },
    {
      label: "Japanese",
      value: "ja",
    },
    {
      label: "Korean",
      value: "ko",
    },
    {
      label: "Chinese",
      value: "zh",
    },
  ] as const;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
    } catch (error) {
      console.error("Form submission error", error);
    }
  }

  const selectedType = form.watch("typeID");

  const filteredModels = selectedType
    ? models.filter((model) => model.typeID === selectedType)
    : models;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 mx-auto py-1 text-white"
      >
        <FormField
          control={form.control}
          name="asset_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="ex: LAPTOP-XX" type="text" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifier</FormLabel>
              <FormControl>
                <Input
                  placeholder="ex: Serial Number / Product Tag"
                  type="text"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="typeID"
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
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? types.find((type) => type.ID === field.value)
                                ?.name
                            : "Select type"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command className="dark">
                        <CommandInput placeholder="Search type..." />
                        <CommandList>
                          <CommandEmpty>No type found.</CommandEmpty>
                          <CommandGroup>
                            {types.map((type: Preset) => (
                              <CommandItem
                                value={type.name}
                                key={type.ID}
                                onSelect={async () => {
                                  if (type.ID === field.value) {
                                    form.resetField("typeID");
                                    if (form.getValues("modelID")) {
                                      form.resetField("modelID");
                                    }
                                  } else {
                                    if (form.getValues("modelID")) {
                                      form.resetField("modelID");
                                    }
                                    form.setValue("typeID", type.ID);
                                    await form.trigger("typeID");
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    type.ID === field.value
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
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="modelID"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Model</FormLabel>
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
                            ? filteredModels.find(
                                (model) => model.ID === field.value
                              )?.name
                            : "Select model"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command className="dark">
                        <CommandInput placeholder="Search model..." />
                        <CommandList>
                          <CommandEmpty>No model found.</CommandEmpty>
                          <CommandGroup>
                            {filteredModels.map((model) => (
                              <CommandItem
                                value={model.name}
                                key={model.ID}
                                onSelect={async () => {
                                  if (field.value === model.ID) {
                                    form.resetField("modelID");
                                  } else {
                                    form.setValue("modelID", model.ID);
                                    await form.trigger("modelID");
                                    if (
                                      model.typeID &&
                                      selectedType !== model.typeID
                                    ) {
                                      form.setValue("typeID", model.typeID);
                                      await form.trigger("typeID");
                                    }
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    model.ID === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {model.name}
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
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="locationID"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Location</FormLabel>
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
                            ? locations.find(
                                (location) => location.ID === field.value
                              )?.name
                            : "Select location"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command className="dark">
                        <CommandInput placeholder="Search location..." />
                        <CommandList>
                          <CommandEmpty>No location found.</CommandEmpty>
                          <CommandGroup>
                            {locations.map((location) => (
                              <CommandItem
                                value={location.name}
                                key={location.ID}
                                onSelect={async () => {
                                  if (field.value === location.ID) {
                                    form.resetField("locationID");
                                  } else {
                                    form.setValue("locationID", location.ID);
                                    await form.trigger("locationID");
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    location.ID === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {location.name}
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

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="departmentID"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Department</FormLabel>
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
                            ? departments.find(
                                (department) => department.ID === field.value
                              )?.name
                            : "Select department"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command className="dark">
                        <CommandInput placeholder="Search department..." />
                        <CommandList>
                          <CommandEmpty>No department found.</CommandEmpty>
                          <CommandGroup>
                            {departments.map((department) => (
                              <CommandItem
                                value={department.name}
                                key={department.ID}
                                onSelect={async () => {
                                  if (field.value === department.ID) {
                                    form.resetField("departmentID");
                                  } else {
                                    form.setValue(
                                      "departmentID",
                                      department.ID
                                    );
                                    await form.trigger("departmentID");
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    department.ID === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {department.name}
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
        </div>

        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Assigned To</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : "Select language"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command className="dark">
                    <CommandInput placeholder="Search language..." />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        {languages.map((language) => (
                          <CommandItem
                            value={language.label}
                            key={language.value}
                            onSelect={() => {
                              form.setValue("assignedTo", language.value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                language.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {language.label}
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

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Purchase Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 dark" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="warrantyDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Warranty Exp.</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 dark" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="ipAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0.0.0.0" type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="macAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MAC Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00-00-00-00-00-00"
                      type="text"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost</FormLabel>
              <FormControl>
                <CurrencyInput
                  id="cost"
                  placeholder="$0.00"
                  decimalsLimit={2}
                  prefix="$"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value || "");
                  }}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
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
          <Button type="submit">Add</Button>
        </div>
      </form>
    </Form>
  );
}
