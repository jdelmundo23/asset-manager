import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPortal,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/shadcn-ui/alert-dialog";
import { useHandleAction } from "@/lib/Actions";
import { SubnetRow } from "@shared/schemas";

interface DeleteSubnetProps {
  subnet: SubnetRow;
  children: JSX.Element;
}

export default function DeleteSubnet({ subnet, children }: DeleteSubnetProps) {
  const { handleAction } = useHandleAction();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the subnet and all associated
              IPs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await handleAction("subnet", "delete", subnet);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
