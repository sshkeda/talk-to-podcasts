import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { User } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export default function AccountButton() {
  const authTokenCookie = cookies().get("auth_token");

  if (!authTokenCookie)
    return (
      <Button variant="secondary" asChild>
        <Link href="/api/auth/authorize?provider=builtin::oauth_google">
          Authorize with Google
        </Link>
      </Button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <User />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent  className="top-ri">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/api/auth/disconnect">Disconnect</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
