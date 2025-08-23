import { useRef, useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip";

export function TruncateHover({
  children,
}: {
  children: string | null | undefined;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    });

    observer.observe(el);

    return () => observer.disconnect();
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
