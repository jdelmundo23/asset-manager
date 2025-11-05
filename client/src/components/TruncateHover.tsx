import { useRef, useState, useEffect, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn-ui/tooltip";
import { cn } from "@/lib/utils";

export function TruncateHover({
  children,
  className,
  onTruncateChange,
  tooltipContent,
}: {
  children: string | null | undefined | JSX.Element | ReactNode;
  className?: string | undefined;
  onTruncateChange?: React.Dispatch<React.SetStateAction<boolean>>;
  tooltipContent?: ReactNode;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      const truncated = el.scrollWidth > el.clientWidth;
      setIsTruncated(truncated);
      onTruncateChange?.(truncated);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [children]);

  return (
    <TooltipProvider disableHoverableContent={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p
            ref={textRef}
            className={cn(
              `truncate ${isTruncated ? "cursor-default" : ""}`,
              className
            )}
          >
            {children}
          </p>
        </TooltipTrigger>
        {isTruncated ? (
          <TooltipContent
            className="pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {tooltipContent || <p>{children}</p>}
          </TooltipContent>
        ) : (
          ""
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
