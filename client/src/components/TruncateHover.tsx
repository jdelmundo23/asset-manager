import { useRef, useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip";

interface TruncateHoverProps {
  children: string;
}

export function TruncateHover({ children }: TruncateHoverProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, [children]);

  return (
    <TooltipProvider disableHoverableContent={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p ref={textRef} className="truncate">
            {children}
          </p>
        </TooltipTrigger>
        {isTruncated ? (
          <TooltipContent className="pointer-events-auto">
            <p>{children}</p>
          </TooltipContent>
        ) : (
          ""
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
