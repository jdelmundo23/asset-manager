import IPContext from "@/context/IPContext";
import { IPRow, ipRowSchema, SubnetRow } from "@shared/schemas";
import { z } from "zod";
import { DataTable } from "./table/NetworkTable";
import TableToolbar from "@/components/TableToolbar";
import AddIP from "./components/AddIP";
import { useEffect, useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import BulkActionDropdown from "@/components/BulkActionDropdown";
import { handleError } from "@/lib/handleError";
import axiosApi from "@/lib/axios";
import SubnetComboxbox from "./components/subnets/SubnetCombobox";
import { useQuery } from "@tanstack/react-query";

function Page() {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const [selectedSubnet, setSelectedSubnet] = useState<SubnetRow | undefined>();

  const ipQuery = useQuery({
    queryKey: ["ipData"],
    queryFn: async () => {
      const response = await axiosApi.get(`/api/ips/all`);
      return z.array(ipRowSchema).parse(response.data);
    },
  });

  useEffect(() => {
    if (ipQuery.isError) {
      handleError(ipQuery.error);
    }
  }, [ipQuery.isError, ipQuery.error]);

  const ips = ipQuery.data ?? [];

  return (
    <div className="container mx-auto flex w-1/2 flex-col gap-2 py-10">
      <IPContext.Provider value={{ ips }}>
        <TableToolbar tableTitle="Network">
          <div className="ml-1 flex w-full justify-between">
            <SubnetComboxbox
              selectedSubnet={selectedSubnet}
              setSelectedSubnet={setSelectedSubnet}
            />
            <div className="flex gap-x-1">
              <BulkActionDropdown
                entity={"ip"}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                deleting
              />

              <AddIP />
            </div>
          </div>
        </TableToolbar>
        <DataTable
          ips={
            ips
              ? selectedSubnet
                ? ips.filter((ip: IPRow) => ip.subnetID === selectedSubnet.ID)
                : ips
              : []
          }
          selectedRow={selectedRows}
          onRowSelect={setSelectedRows}
          animated={true}
        />
      </IPContext.Provider>
    </div>
  );
}

export default Page;
