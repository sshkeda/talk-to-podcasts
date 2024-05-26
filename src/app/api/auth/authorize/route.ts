import { generatePKCE } from "@/app/actions";
import { env } from "@/env";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export const revalidate = 0;

// https://docs.edgedb.com/guides/auth/oauth#retrieve-auth-token
export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  if (!provider) throw new Error("No 'provider' value.");

  if (cookies().get("auth_token")) {
    redirect("/dashboard");
  }

  const { challenge, verifier } = await generatePKCE();

  const redirectTo = new URL("authorize", env.EDGEDB_AUTH_BASE_URL);
  redirectTo.searchParams.set("provider", provider);
  redirectTo.searchParams.set("challenge", challenge);
  redirectTo.searchParams.set("redirect_to", env.EDBEDB_AUTH_REDIRECT_URL);

  cookies().set("edgedb-pkce-verifier", verifier, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 5 * 60 * 1000),
  });

  redirect(redirectTo.href);
}
