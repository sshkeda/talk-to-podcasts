import { Button } from "@/components/ui/button";
import { auth, e } from "@/lib/edgedb";
import { revalidatePath } from "next/cache";

export default function ResetPodcast({ id }: { id: string }) {
  async function resetPodcast() {
    "use server";

    const { client } = auth();
    await e
      .update(e.Podcast, () => ({
        filter_single: {
          id,
        },
        set: {
          messages: "[]",
        },
      }))
      .run(client);

    revalidatePath(`/dashboard/${id}`);
  }

  return (
    <form action={resetPodcast}>
      <Button size="sm" variant="outline">
        Reset
      </Button>
    </form>
  );
}
