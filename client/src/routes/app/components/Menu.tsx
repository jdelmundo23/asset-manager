import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigation } from "react-router";
import { modules } from "@/lib/modules";

export default function Menu() {
  const navigation = useNavigation();
  const [menuClicked, setMenuClicked] = useState<boolean>(false);
  return (
    <div className="mt-24 flex w-full justify-center">
      <div className="grid w-5/6 gap-6 sm:w-3/5 md:w-4/5 md:grid-cols-2 lg:w-3/5">
        {modules.map((module) => (
          <Link key={module.link} to={module.link}>
            <Card
              className="bg-muted stretch dark flex h-full w-full justify-between transition-all duration-100 hover:scale-[101%] hover:brightness-125"
              onClick={() => setMenuClicked(true)}
            >
              <CardHeader>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center px-3 pt-6 lg:px-6">
                <div className="h-5 w-5">
                  {navigation.location?.pathname === module.link &&
                    menuClicked && (
                      <Loader2
                        className="flex animate-spin transition-all [transform-origin:center]"
                        color="gray"
                      />
                    )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
