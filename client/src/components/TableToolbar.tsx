import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface TableToolbarProps {
  tableTitle: string;
  children?: JSX.Element;
}

export default function TableToolbar({
  tableTitle,
  children,
}: TableToolbarProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <ChevronLeft
          onClick={() => navigate("/app")}
          className="cursor-pointer transition-all duration-150 hover:scale-125"
        />
        <h1 className="text-2xl font-medium">{tableTitle}</h1>
      </div>
      <div>{children}</div>
    </div>
  );
}
