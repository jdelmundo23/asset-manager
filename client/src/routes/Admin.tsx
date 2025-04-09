import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Link } from "react-router";

const cards = [
  {
    link: "/admin/assets",
    title: "Assets",
    description: "View and manage all assets",
  },
  {
    link: "/admin/Phones",
    title: "Phones",
    description: "View and manage phones",
  },
  {
    link: "/admin/presets",
    title: "Presets",
    description: "Manage inventory presets",
  },
  {
    link: "/admin/network",
    title: "Network",
    description: "View and manage network IPs",
  },
];

function Admin() {
  return (
    <div className="mt-24 flex w-full justify-center">
      <div className="grid w-3/5 grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link key={card.link} to={card.link}>
            <Card className="dark w-full transition-all duration-100 hover:scale-[101%] hover:brightness-125">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Admin;
