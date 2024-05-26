import { createClient } from "edgedb";
import e from "./edgeql-js";
import { cookies } from "next/headers";

export const client = createClient();
export const isSignedIn = e.op("exists", e.global.current_user);

export function auth(auth_token: string | null = null) {
  const authTokenCookie = cookies().get("auth_token");
  if (!authTokenCookie && !auth_token)
    return {
      client,
      authToken: null,
    };

  return {
    client: createClient().withGlobals({
      "ext::auth::client_token": auth_token || authTokenCookie?.value || "",
    }),
    auth_token: auth_token || authTokenCookie?.value || "",
  };
}

export { e };
