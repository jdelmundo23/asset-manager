import { Monitor, NotepadText, Phone, User, Wifi } from "lucide-react";

export const modules = [
  {
    link: "/app/assets",
    title: "Assets",
    description: "View and manage all assets",
    icon: Monitor,
  },
  {
    link: "/app/presets",
    title: "Presets",
    description: "Manage asset presets",
    icon: NotepadText,
  },
  {
    link: "/app/network",
    title: "Network",
    description: "View and manage network IPs",
    icon: Wifi,
  },
  {
    link: "/app/users",
    title: "Users",
    description: "View and manage synced users",
    icon: User,
  },
];
