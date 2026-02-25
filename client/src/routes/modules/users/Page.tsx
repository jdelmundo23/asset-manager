import { Card } from "@/components/shadcn-ui/card";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { Separator } from "@/components/shadcn-ui/separator";
import { Skeleton } from "@/components/shadcn-ui/skeleton";
import axiosApi from "@/lib/axios";
import { handleError } from "@/lib/handleError";
import { User } from "@shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import UserRow from "./components/UserRow";
import SelectBox from "./components/SelectBox";
import SyncMsg from "./components/SyncMsg";

type SortDirection = "asc" | "desc" | null;

interface SortButtonProps {
  sort: "asc" | "desc" | null;
  onClick: () => void;
}

const SortButton = ({ sort, onClick }: SortButtonProps) => {
  const renderIcon = () => {
    switch (sort) {
      case "asc":
        return <ArrowUp className="w-5" />;
      case "desc":
        return <ArrowDown className="w-5" />;
      default:
        return <ArrowUpDown className="w-5" />;
    }
  };

  return (
    <button onClick={onClick} className="">
      {renderIcon()}
    </button>
  );
};

export default function Page() {
  const userQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => axiosApi.get(`/api/users/all`).then((res) => res.data),
  });

  const groupNameQuery = useQuery({
    queryKey: ["groupName"],
    queryFn: () =>
      axiosApi.get(`/api/users/group-name`).then((res) => res.data),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const [selected, setSelected] = useState<string>("all");
  const [sort, setSort] = useState<SortDirection>(null);

  useEffect(() => {
    if (userQuery.isError) {
      handleError(userQuery.error);
    }
  }, [userQuery.isError, userQuery.error]);

  const navigate = useNavigate();

  const users = userQuery.data;

  const filteredUsers = useMemo(() => {
    const usersArray = Array.isArray(users) ? users : [];

    let filtered: User[];
    if (selected === "all") {
      filtered = usersArray;
    } else {
      const isActive = selected === "active";
      filtered = usersArray.filter((user) => user.active === isActive);
    }

    if (!sort) return filtered;

    return filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
      return sort === "asc" ? comparison : -comparison;
    });
  }, [users, selected, sort]);

  return (
    <div className="container mx-auto flex w-11/12 flex-col items-center py-10 md:max-w-md">
      <div className="animate-fade-in flex w-full items-center justify-start">
        <ChevronLeft
          onClick={() => navigate("/app")}
          className="cursor-pointer transition-all duration-150 hover:scale-125"
        />
        <h1 className="text-center text-2xl font-medium">Users</h1>
      </div>
      <SyncMsg groupName={groupNameQuery?.data?.groupName} />

      <Separator className="animate-fade-in my-4 mt-0" />
      <div className="animate-fade-in flex w-full items-end justify-end">
        <SelectBox setSelected={setSelected} />
        <div>
          <div className="flex items-center text-nowrap text-sm">
            Sort: Alphabetically
            <SortButton
              sort={sort}
              onClick={() => {
                if (!sort || sort === "desc") setSort("asc");
                else if (sort === "asc") setSort("desc");
              }}
            />
          </div>
        </div>
      </div>
      <Card className="animate-fade-in-up h-96 w-full">
        <ScrollArea className="h-full w-full rounded-md font-medium">
          {userQuery.isLoading ? (
            <div className="flex flex-col space-y-3 p-4">
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col space-y-3 p-4 duration-150">
              {filteredUsers.map((row: User) => (
                <UserRow key={row.ID} user={row} />
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
