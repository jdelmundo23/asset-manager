import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";

interface SelectBoxProps {
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}

export default function SelectBox({ setSelected }: SelectBoxProps) {
  return (
    <div className="w-full">
      <Select defaultValue="all" onValueChange={setSelected}>
        <SelectTrigger className="bg-background text-foreground animate-fade-in mb-1 w-36 font-semibold">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
