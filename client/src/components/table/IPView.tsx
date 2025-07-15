import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "../shadcn-ui/dialog";
import { IPRow } from "@shared/schemas";
import { useState, useEffect } from "react";
import { Skeleton } from "../shadcn-ui/skeleton";
import { TruncateHover } from "../TruncateHover";
import { ScrollArea } from "../shadcn-ui/scroll-area";
import { formatIP } from "@/lib/utils";

interface IPViewProps {
  assetID: number;
  assetName: string;
}

export default function IPView({ assetID, assetName }: IPViewProps) {
  const [ips, setIps] = useState<IPRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchIPs = async () => {
        setLoading(true);

        try {
          const response = await axiosApi.get(`/api/ips/by-asset/${assetID}`);
          setIps(response.data);
        } catch (error) {
          handleError(error);
        } finally {
          setLoading(false);
        }
      };
      fetchIPs();
    }
  }, [isOpen, assetID]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <button className="whitespace-nowrap text-blue-600 underline">
          View
        </button>
      </DialogTrigger>
      <DialogContent className="h-44 max-w-lg text-white transition-all">
        <DialogHeader>
          <DialogTitle>{assetName}</DialogTitle>
          <div className="text-muted-foreground grid grid-cols-[1.25fr_1.5fr_1.75fr_0.5fr] gap-x-2 text-sm font-medium">
            <p>IP</p>
            <p>Name</p>
            <p>MAC</p>
            <p>Note</p>
          </div>
          <ScrollArea className="grid h-20 text-sm">
            {loading ? (
              <div className="space-y-3 border-t pt-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1.25fr_1.5fr_1.75fr_0.5fr] gap-x-4"
                  >
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : ips.length === 0 ? (
              <p className="animate-fade-in border-t pt-4 text-center duration-150">
                No IPs found for this asset.
              </p>
            ) : (
              ips.map((ip) => {
                const ipAddress = formatIP(ip);
                return (
                  <div
                    key={ipAddress}
                    className="animate-fade-in grid grid-cols-[1.25fr_1.5fr_1.75fr_0.5fr] gap-x-2 border-t py-1 duration-150"
                  >
                    <p>{ipAddress}</p>
                    <TruncateHover>{ip.name}</TruncateHover>
                    <p>{ip.macAddress}</p>
                    <p>View</p>
                  </div>
                );
              })
            )}
          </ScrollArea>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
