import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { utapi } from "@/app/api/uploadthing/core";
import { auth, e } from "@/lib/edgedb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default function DeletePodcast({
  id,
  fileKey,
}: {
  id: string;
  fileKey: string;
}) {
  async function deletePodcast() {
    "use server";

    await utapi.deleteFiles(fileKey);
    const { client } = auth();

    await e
      .delete(e.Podcast, () => ({
        filter_single: { id },
      }))
      .run(client);

    revalidatePath("/dashboard");

    redirect("/dashboard");
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            podcast and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deletePodcast}>
            <AlertDialogAction asChild>
              <Button type="submit" variant="destructive">
                Delete
              </Button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
