import { IPProvider, useIPs } from "@/context/IPContext";
import { IPRow, SubnetRow } from "@shared/schemas";
import { DataTable } from "./table/NetworkTable";
import TableToolbar from "@/components/TableToolbar";
import AddIP from "./components/ips/AddIP";
import { useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import BulkActionDropdown from "@/components/BulkActionDropdown";
import SubnetComboxbox from "./components/subnets/SubnetCombobox";

function Page() {
  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const [selectedSubnet, setSelectedSubnet] = useState<SubnetRow | undefined>();

  return (
    <div className="container mx-auto flex w-1/2 flex-col gap-2 py-10">
      <IPProvider>
        <IPPageContent
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          selectedSubnet={selectedSubnet}
          setSelectedSubnet={setSelectedSubnet}
        />
      </IPProvider>
    </div>
  );
}

function IPPageContent({
  selectedRows,
  setSelectedRows,
  selectedSubnet,
  setSelectedSubnet,
}: {
  selectedRows: RowSelectionState;
  setSelectedRows: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  selectedSubnet: SubnetRow | undefined;
  setSelectedSubnet: React.Dispatch<
    React.SetStateAction<SubnetRow | undefined>
  >;
}) {
  const { ips } = useIPs();

  const filteredIPs = selectedSubnet
    ? ips.filter((ip: IPRow) => ip.subnetID === selectedSubnet.ID)
    : ips;

  return (
    <>
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
        ips={filteredIPs}
        selectedRow={selectedRows}
        onRowSelect={setSelectedRows}
        animated={true}
      />
    </>
  );
}

export default Page;
