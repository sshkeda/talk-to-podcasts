import { auth, e } from "@/lib/edgedb";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Podcasts() {
  const { client } = auth();
  const podcasts = await e
    .select(e.Podcast, () => ({
      id: true,
      name: true,
    }))
    .run(client);

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-3">
        {podcasts.map(({ id, name }) => (
          <Button variant="outline" key={id} asChild>
            <Link href={`/dashboard/${id}`}>{name}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
