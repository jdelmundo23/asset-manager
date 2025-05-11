import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function PlaceholderRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info(
      "This module or feature is a work in progress and not available yet."
    );
    navigate("/");
  }, [navigate]);

  return null;
}
