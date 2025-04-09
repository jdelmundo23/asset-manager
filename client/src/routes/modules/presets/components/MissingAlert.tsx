import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip";
import { TriangleAlert } from "lucide-react";
interface MissingAlertProps {
  message: string;
}

function MissingAlert({ message }: MissingAlertProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-default">
          <TriangleAlert
            className="pointer-events-none h-4 w-4 opacity-100"
            color="#ff0000"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default MissingAlert;
