import { Card } from "@/components/shadcn-ui/card";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { Separator } from "@/components/shadcn-ui/separator";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { PresetRow } from "@shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Page() {
  const userQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => axiosApi.get(`/api/users/all`).then((res) => res.data),
  });

  useEffect(() => {
    if (userQuery.isError) {
      handleError(userQuery.error);
    }
  }, [userQuery.isError, userQuery.error]);

  const navigate = useNavigate();

  return (
    <div className="container mx-auto flex w-11/12 flex-col items-center py-10 md:w-3/5">
      <div className="animate-fade-in flex w-full max-w-md items-center justify-start">
        <ChevronLeft
          onClick={() => navigate("/app")}
          className="cursor-pointer transition-all duration-150 hover:scale-125"
        />
        <h1 className="text-center text-2xl font-medium">Users</h1>
      </div>
      <Separator className="animate-fade-in my-4 max-w-md" />
      <Card className="animate-fade-in-up h-96 w-full max-w-md">
        <ScrollArea className="h-full w-full rounded-md font-medium">
          {userQuery.isLoading ? (
            <div className="flex flex-col space-y-3 p-4">
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col space-y-3 p-4 duration-150">
              {userQuery?.data?.map((row: PresetRow) => (
                <div key="">
                  <Card className="bg-foreground border-muted px-2 py-1 font-semibold text-black">
                    <div className="group flex items-center justify-between">
                      <p
                        title={row.name}
                        className="w-5/6 max-w-[200px] truncate lg:max-w-[300px]"
                      >
                        {row.name}
                      </p>
                      <div className="relative flex items-center space-x-2">
                        <div className="flex items-center space-x-2 opacity-0 transition-opacity ease-out group-hover:opacity-100"></div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
