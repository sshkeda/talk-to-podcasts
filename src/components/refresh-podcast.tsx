import { Button } from "@/components/ui/button";

export default function ResetPodcast({ id }: { id: string }) {
  async function resetPodcast() {
    "use server";
    // TODO
    console.log("restarting " + id);
  }

  return (
    <form action={resetPodcast}>
      <Button size="sm" variant="outline">
        Reset
      </Button>
    </form>
  );
}
