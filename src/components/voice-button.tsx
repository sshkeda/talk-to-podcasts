"use client";

import { useMicrophone } from "@/lib/hooks/use-microphone";
import { Button } from "./ui/button";
import { Mic, MicOff } from "lucide-react";
import { useDeepgram } from "@/lib/hooks/use-deepgram";
import { Body } from "@/app/api/chat/route";
import { UseChatHelpers } from "ai/react";
import { useGlobalAudioPlayer } from "react-use-audio-player";

export default function VoiceButton({
  deepgramKey,
  body,
  append,
}: {
  deepgramKey: string;
  body: () => Body;
  append: UseChatHelpers["append"];
}) {
  const { pause } = useGlobalAudioPlayer();
  const { onData } = useDeepgram({
    key: deepgramKey,
    silenceDelay: 1500,
    onTranscript: async (transcription) => {
      const transcript = transcription.channel.alternatives[0].transcript;

      if (transcript === "") return;

      if ((window as any).podcastPlaying) {
        pause();
        (window as any).podcastPlaying = false;
        (window as any).podcastWaitingToResume = true;
      }
      await append(
        {
          role: "user",
          content: transcript,
        },
        {
          options: {
            body: body(),
          },
        },
      );
    },
  });
  const { startListening, stopListening, microphoneState } = useMicrophone({
    timeslice: 250,
    onData,
  });

  return microphoneState === "recording" ? (
    <Button
      size="icon"
      className="aspect-square h-full"
      type="button"
      variant="ghost"
      onClick={stopListening}
    >
      <Mic className="h-4 w-4" />
    </Button>
  ) : (
    <Button
      size="icon"
      className="aspect-square h-full"
      type="button"
      variant="ghost"
      onClick={startListening}
    >
      <MicOff className="h-4 w-4 stroke-red-700" />
    </Button>
  );
}
