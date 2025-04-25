import { Monitor, NotepadText, Phone, Wifi } from "lucide-react";

export const modules = [
  {
    link: "/app/assets",
    title: "Assets",
    description: "View and manage all assets",
    icon: Monitor,
  },
  {
    link: "/app/Phones",
    title: "Phones",
    description: "View and manage phones",
    icon: Phone,
  },
  {
    link: "/app/presets",
    title: "Presets",
    description: "Manage inventory presets",
    icon: NotepadText,
  },
  {
    link: "/app/network",
    title: "Network",
    description: "View and manage network IPs",
    icon: Wifi,
  },
];
