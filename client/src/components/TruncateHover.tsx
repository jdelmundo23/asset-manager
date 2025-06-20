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
      const timeout = setTimeout(() => {
        setIsTruncated(el.scrollWidth > el.clientWidth);
      }, 50);

      return () => clearTimeout(timeout);
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
          <TooltipContent
            className="pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p>{children}</p>
          </TooltipContent>
        ) : (
          ""
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
