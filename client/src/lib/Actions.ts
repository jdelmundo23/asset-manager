import {
  Asset,
  AssetRow,
  IPInput,
  IPRow,
  Subnet,
  SubnetRow,
} from "@shared/schemas";
import { FetcherWithComponents } from "react-router";
import {
  showInfoToast,
  showListUpdateErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toasts";
import { handleError } from "./handleError";
import axiosApi from "./axios";
import { AxiosResponse } from "axios";

type ActionType = "add" | "edit" | "delete" | "duplicate";

type EndpointType = "asset" | "ip" | "subnet";

type Entity = Asset | AssetRow | IPInput | IPRow | Subnet | SubnetRow;

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

export const handleAction = async <T extends Entity, R>(
  endpointType: EndpointType,
  actionType: ActionType,
  values: T,
  fetcher?: FetcherWithComponents<any>
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

  const loadingToast = showLoadingToast(
    `${action.ing} ${endpointType}`,
    "subnetPrefix" in values ? (values.subnetPrefix ?? "") : values.name
  );

  try {
    const response = await axiosApi[action.method](
      action.url(endpointType, values),
      values
    );

    try {
      await fetcher?.load(
        `/app/${endpointType === "asset" ? "assets" : "network"}`
      );

      const toastType = actionType === "add" ? showSuccessToast : showInfoToast;
      toastType(
        loadingToast,
        `${action.ed} ${endpointType}`,
        "subnetPrefix" in values ? (values.subnetPrefix ?? "") : values.name
      );
    } catch {
      showListUpdateErrorToast(loadingToast);
    }

    return response;
  } catch (error) {
    handleError(error, loadingToast);

    throw error;
  }
};
