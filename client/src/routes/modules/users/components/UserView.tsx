import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/shadcn-ui/scroll-area";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import { TruncateHover } from "@/components/TruncateHover";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { AssetSummary, User } from "@shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

const displayKeys: (keyof AssetSummary)[] = [
  "identifier",
  "name",
  "typeName",
  "modelName",
  "locationName",
];

const headers = ["Identifier", "Name", "Type", "Model", "Location"];

const initialSizes = [20, 20, 20, 20, 20];

export default function UserView({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [open, setOpen] = useState(false);
  const [sizes, setSizes] = useState<number[]>(initialSizes);
  const sizesRef = useRef<number[]>(initialSizes);

  const userAssetsQuery = useQuery({
    queryKey: ["userAssets", user.ID],
    queryFn: () =>
      axiosApi.get(`/api/users/${user.ID}/assets`).then((res) => res.data),
    enabled: !!user.ID && open,
  });

  useEffect(() => {
    if (userAssetsQuery.isError) {
      handleError(userAssetsQuery.error);
    }
  }, [userAssetsQuery.isError, userAssetsQuery.error]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setSizes(initialSizes);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-48 max-w-2xl text-white transition-all">
        <DialogHeader>
          <DialogTitle>Assets - {user.name}</DialogTitle>

          <ResizeHeader sizesRef={sizesRef} setSizes={setSizes} />
          <div className="w-full border-b"></div>
          <ScrollArea
            className="grid h-20 text-sm"
            style={{ marginTop: "0px" }}
          >
            {userAssetsQuery.isLoading ? (
              <SkeletonList sizes={sizes} />
            ) : userAssetsQuery.data?.length === 0 ? (
              <p className="animate-fade-in pt-4 text-center duration-150">
                No assets found for this user.
              </p>
            ) : (
              <AssetList assets={userAssetsQuery.data} sizes={sizes} />
            )}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {userAssetsQuery.data?.length > 0 && (
            <p className="text-muted-foreground text-sm">
              {userAssetsQuery.data?.length} asset(s) in total
            </p>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function ResizeHeader({
  sizesRef,
  setSizes,
}: {
  sizesRef: React.MutableRefObject<number[]>;
  setSizes: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  return (
    <ResizablePanelGroup
      className="group max-h-5 text-sm"
      direction="horizontal"
      onLayout={(newSizes) => {
        sizesRef.current = newSizes;
      }}
    >
      {headers.map((header, index) => (
        <>
          <ResizablePanel
            defaultSize={20}
            className="text-muted-foreground font-medium"
          >
            {header}
          </ResizablePanel>
          {index < headers.length - 1 && (
            <ResizableHandle
              className="bg-white/35 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
              onDragging={(isDragging) =>
                !isDragging && setSizes([...sizesRef.current])
              }
            />
          )}
        </>
      ))}
    </ResizablePanelGroup>
  );
}

function SkeletonList({ sizes }: { sizes: number[] }) {
  return [1, 2, 3].map((i) => (
    <div
      key={i}
      className="animate-fade-in mt-px grid py-1 duration-150"
      style={{
        gridTemplateColumns: sizes.map((s) => `${s}%`).join(" "),
      }}
    >
      {displayKeys.map((_, i) => (
        <Skeleton key={i} className="h-3 w-11/12" />
      ))}
    </div>
  ));
}

function AssetList({
  assets,
  sizes,
}: {
  assets: AssetSummary[];
  sizes: number[];
}) {
  return assets.map((asset: AssetSummary) => {
    return (
      <div
        key={asset.ID}
        className="animate-fade-in grid border-t py-1 duration-150"
        style={{
          gridTemplateColumns: sizes.map((s) => `${s}%`).join(" "),
        }}
      >
        {displayKeys.map((key) => (
          <p key={key} className="pr-1">
            <TruncateHover>{asset[key]?.toString()}</TruncateHover>
          </p>
        ))}
      </div>
    );
  });
}
