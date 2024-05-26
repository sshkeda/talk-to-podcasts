import { env } from "@/env";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";
import { e, client } from "@/lib/edgedb";
import { permanentRedirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

// https://docs.edgedb.com/guides/auth/built_in_ui#retrieve-auth-token
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) throw new Error("No 'code' parameter found.");

  const verifierCookie = cookies().get("edgedb-pkce-verifier");
  const verifier = verifierCookie?.value;
  if (!verifier) throw new Error("No 'edgedb-pkce-verifier' cookie found.");

  const exchangeTokenURL = new URL("token", env.EDGEDB_AUTH_BASE_URL);
  exchangeTokenURL.searchParams.set("code", code);
  exchangeTokenURL.searchParams.set("verifier", verifier);

  const response = await fetch(exchangeTokenURL);
  if (!response.ok) throw new Error("Failed to exchange code for token.");

  const json = await response.json();
  const { auth_token, identity_id } = z
    .object({
      auth_token: z.string(),
      identity_id: z.string(),
    })
    .parse(json);

  await e
    .insert(e.User, {
      identity: e.select(e.ext.auth.Identity, () => ({
        filter_single: {
          id: identity_id,
        },
      })),
    })
    .unlessConflict()
    .run(client);

  cookies().set("auth_token", auth_token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // TODO: Test on production
    secure: process.env.NODE_ENV === "production",
  });
  cookies().delete("edgedb-pkce-verifier");

  revalidatePath("/", "layout");

  permanentRedirect("/dashboard");
}
