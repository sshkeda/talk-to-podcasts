import AudioPlayer from "@/components/audio-player";
import { e, auth } from "@/lib/edgedb";
import { redirect } from "next/navigation";
import DeletePodcast from "@/components/delete-podcast";
import ResetPodcast from "@/components/reset-podcast";
import Chat from "@/components/chat";
import { getDeepgramKey } from "@/app/actions";
import { Message } from "ai/react";
import { Transcription } from "@/app/api/uploadthing/core";

export default async function Podcast({
  params,
}: {
  params: { podcastId: string };
}) {
  const { client } = auth();
  const podcast = await e
    .select(e.Podcast, () => ({
      id: true,
      url: true,
      key: true,
      name: true,
      bytes: true,
      messages: true,
      transcription: true,
      filter_single: {
        id: params.podcastId,
      },
    }))
    .run(client);

  if (!podcast) redirect("/dashboard");

  const deepgramKey = await getDeepgramKey();

  return (
    <div className="mx-auto mt-2 max-w-screen-lg">
      <div className="flex items-end justify-between">
        <h2>{podcast.name}</h2>
        <div className="flex space-x-2">
          <ResetPodcast id={podcast.id} />
          <DeletePodcast id={podcast.id} fileKey={podcast.key} />
        </div>
      </div>
      <div className="mt-2 space-y-2">
        <Chat
          src={podcast.url}
          id={podcast.id}
          bytes={podcast.bytes}
          deepgramKey={deepgramKey}
          initialMessages={JSON.parse(podcast.messages) as Message[]}
          transcription={JSON.parse(podcast.transcription) as Transcription[]}
        />
        <AudioPlayer src={podcast.url} />
      </div>
    </div>
  );
}
