import {
  Asset,
  AssetRow,
  IPInput,
  IPRow,
  Subnet,
  SubnetRow,
} from "@shared/schemas";

import { handleError } from "./handleError";
import axiosApi from "./axios";
import { AxiosResponse } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ActionType = "add" | "edit" | "delete" | "duplicate";

type EndpointType = "asset" | "ip" | "subnet";

type Entity = Asset | AssetRow | IPInput | IPRow | Subnet | SubnetRow;

const queryKeys: Record<EndpointType, string> = {
  asset: "assetData",
  ip: "ipData",
  subnet: "subnetData",
} as const;

interface Action<T extends Entity> {
  ing: string;
  ed: string;
  url: (endpoint: EndpointType, values: T) => string;
  method: "post" | "put" | "delete";
}

const actions: Record<ActionType, Action<Entity>> = {
  add: {
    method: "post",
    url: (endpoint) => `/api/${endpoint}s`,
    ing: "Adding",
    ed: "Added",
  },
  edit: {
    method: "put",
    url: (endpoint) => `/api/${endpoint}s`,
    ing: "Editing",
    ed: "Edited",
  },
  delete: {
    method: "delete",
    url: (endpoint, values) => `/api/${endpoint}s/${values.ID}`,
    ing: "Deleting",
    ed: "Deleted",
  },
  duplicate: {
    method: "post",
    url: (endpoint) => `/api/${endpoint}s/duplicate`,
    ing: "Duplicating",
    ed: "Duplicated",
  },
} as const;

export const useHandleAction = <T extends Entity, R>() => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AxiosResponse<R>,
    unknown,
    {
      action: Action<T>;
      endpointType: EndpointType;
      values: T;
    }
  >({
    mutationFn: ({ action, endpointType, values }) =>
      axiosApi[action.method](action.url(endpointType, values), values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys[variables.endpointType]],
      });
    },
  });

  const handleAction = async (
    endpointType: EndpointType,
    actionType: ActionType,
    values: T
  ): Promise<AxiosResponse<R>> => {
    if (
      (actionType === "edit" ||
        actionType === "delete" ||
        actionType === "duplicate") &&
      !("ID" in values)
    ) {
      throw new Error(`Cannot ${actionType} ${endpointType}: Missing ID.`);
    }

    const action = actions[actionType];

    const toastReturn = toast.promise(
      mutation.mutateAsync({ action, endpointType, values }),
      {
        loading: `${action.ing} ${endpointType}`,
        success: `${action.ed} ${endpointType}`,
      }
    );

    const toastID =
      typeof toastReturn === "string" || typeof toastReturn === "number"
        ? toastReturn.valueOf()
        : undefined;

    return toastReturn
      .unwrap()
      .then((response) => response)
      .catch((error) => {
        handleError(error, toastID);
        throw error;
      });
  };

  return { handleAction, mutation };
};
