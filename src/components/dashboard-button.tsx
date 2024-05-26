"use client";

import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";

export default function DashboardButton() {
  const pathname = usePathname();

  return (
    <Button
      size="sm"
      variant={pathname.startsWith("/dashboard") ? "secondary" : "outline"}
      asChild
    >
      <Link href="/api/auth/authorize?provider=builtin::oauth_google">
        Dashboard
      </Link>
    </Button>
  );
}
