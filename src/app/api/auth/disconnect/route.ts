import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { permanentRedirect } from "next/navigation";

export const revalidate = 0;

export function GET() {
  cookies().delete("auth_token");
  revalidatePath("/", "layout");
  revalidate;
  permanentRedirect("/");
}
