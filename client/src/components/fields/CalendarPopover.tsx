import { cn } from "@/lib/utils";
import { Button } from "../shadcn-ui/button";
import { FormControl } from "../shadcn-ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn-ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../shadcn-ui/calendar";
import { format } from "date-fns";
import { useState } from "react";

interface CalendarPopoverProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeHolder: string;
  useFormControl?: boolean;
  width?: number;
}

export default function CalendarPopover({
  value,
  onChange,
  placeHolder,
  useFormControl,
  width,
}: CalendarPopoverProps) {
  const [open, setOpen] = useState<boolean>(false);
  const trigger = (
    <Button
      variant={"outline"}
      className={cn(
        `${width ? `w-[${width}px]` : "w-full"} pl-3 pr-2 text-left font-normal`,
        !value && "text-muted-foreground"
      )}
    >
      {value ? format(value, "PPP") : <span>{placeHolder}</span>}
      <div className="ml-auto flex gap-x-1">
        <CalendarIcon className="h-4 w-4 opacity-50" />
      </div>
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {useFormControl ? <FormControl>{trigger}</FormControl> : trigger}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(day, selectedDay) => {
            if (value !== selectedDay) {
              onChange(selectedDay);
              setOpen(false);
            }
          }}
          captionLayout="dropdown-buttons"
          initialFocus
          defaultMonth={value}
          fromYear={2000}
          toYear={2040}
        />
      </PopoverContent>
    </Popover>
  );
}
