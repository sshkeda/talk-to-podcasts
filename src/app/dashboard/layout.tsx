import { auth, isSignedIn } from "@/lib/edgedb";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { client } = auth();
  const signedIn = await isSignedIn.run(client);
  if (!signedIn) redirect("/api/auth/authorize?provider=builtin::oauth_google");

  return children;
}
