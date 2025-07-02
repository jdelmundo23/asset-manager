import { handleError } from "./handleError";
import axiosApi from "./axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { toast } from "sonner";

type ActionType = "duplicate" | "edit" | "delete";

type EndpointType = "asset" | "ip" | "subnet";

interface Action {
  ing: string;
  ed: string;
  url: (endpoint: EndpointType) => string;
  method: "post" | "put";
}

const queryKeys: Record<EndpointType, string> = {
  asset: "assetData",
  ip: "ipData",
  subnet: "subnetData",
} as const;

const actions: Record<ActionType, Action> = {
  delete: {
    method: "post",
    url: (endpoint) => `/api/${endpoint}s/bulk/delete`,
    ing: "Deleting",
    ed: "Deleted",
  },
  edit: {
    method: "put",
    url: (endpoint) => `/api/${endpoint}s/bulk/edit`,
    ing: "Editing",
    ed: "Edited",
  },
  duplicate: {
    method: "post",
    url: (endpoint) => `/api/${endpoint}s/bulk/duplicate`,
    ing: "Duplicating",
    ed: "Duplicated",
  },
} as const;

export const useBulkAction = <R>() => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AxiosResponse<R>,
    unknown,
    {
      action: Action;
      endpointType: EndpointType;
      ids: string[];
    }
  >({
    mutationFn: ({ action, endpointType, ids }) =>
      axiosApi[action.method](action.url(endpointType), { ids }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys[variables.endpointType]],
      });
    },
  });

  const handleBulkAction = async (
    endpointType: EndpointType,
    actionType: ActionType,
    ids: string[]
  ): Promise<AxiosResponse<R>> => {
    const action = actions[actionType];

    const toastReturn = toast.promise(
      mutation.mutateAsync({ action, endpointType, ids }),
      {
        loading: `${action.ing} ${endpointType}(s)`,
        success: `${action.ed} ${endpointType}(s)`,
      }
    );

    const toastID =
      typeof toastReturn === "string" || typeof toastReturn === "number"
        ? toastReturn
        : undefined;

    return toastReturn
      .unwrap()
      .then((response) => response)
      .catch((error) => {
        handleError(error, toastID);
        throw error;
      });
  };
  return { handleBulkAction, mutation };
};
