import { toast } from "sonner";
import axios from "axios";
import { Asset, AssetRow, IP, IPRow } from "@shared/schemas";
import { FetcherWithComponents } from "react-router";

type ActionType = "add" | "edit" | "delete";

type EndpointType = "asset" | "ip";

interface Action {
  ing: string;
  ed: string;
  url: (
    endpoint: EndpointType,
    values: Asset | AssetRow | IP | IPRow
  ) => string;
  method: "post" | "put" | "delete";
}

const actions: Record<ActionType, Action> = {
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
} as const;

export const handleAction = async (
  endpointType: EndpointType,
  actionType: ActionType,
  values: Asset | AssetRow | IP | IPRow,
  fetcher: FetcherWithComponents<any> | undefined
): Promise<void> => {
  if ((actionType === "edit" || actionType === "delete") && !("ID" in values)) {
    throw new Error(`Cannot ${actionType} ${endpointType}: Missing ID.`);
  }

  const action = actions[actionType];

  const loadingToast = toast.loading(
    <div>
      {action.ing} {endpointType}: <b>{values.name}</b>
    </div>
  );
  try {
    if ("ipAddress" in values) {
      await axios[action.method](action.url(endpointType, values), values);
    } else {
      await axios[action.method](action.url(endpointType, values), values);
    }
    try {
      await fetcher?.load(
        `/app/${endpointType === "asset" ? "assets" : "network"}`
      );

      const toastType = actionType === "add" ? toast.success : toast.info;

      toastType(
        <div>
          {action.ed} {endpointType}: <b>{values.name}</b>
        </div>,
        {
          id: loadingToast,
        }
      );
    } catch {
      toast.error(<div>Failed to update list</div>, {
        id: loadingToast,
      });
    }
  } catch (error) {
    console.error(
      `${action.ing} ${endpointType} failed: Error: `,
      axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : error
    );
    toast.error(
      <div>
        Failed to {actionType} {endpointType}: <b>{values.name}</b>
      </div>,
      {
        id: loadingToast,
      }
    );
    throw error;
  }
};
