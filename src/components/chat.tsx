"use client";

import { Message, useChat } from "ai/react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import TextareaAutosize from "react-textarea-autosize";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { useAudioPlayer, useGlobalAudioPlayer } from "react-use-audio-player";
import { useAudioTime } from "@/lib/hooks/use-audio-time";
import { CornerDownLeft } from "lucide-react";
import VoiceButton from "./voice-button";
import { Transcription } from "@/app/api/uploadthing/core";
import { useEffect, useRef } from "react";

export default function Chat({
  id,
  src,
  bytes,
  deepgramKey,
  transcription,
  initialMessages,
}: {
  id: string;
  src: string;
  bytes: number;
  deepgramKey: string;
  transcription: Transcription[];
  initialMessages: Message[];
}) {
  const position = useAudioTime();
  const {
    duration,
    play: resumePodcast,
    pause: pausePodcast,
    playing,
  } = useGlobalAudioPlayer();
  const { load, cleanup } = useAudioPlayer();
  const isAssistantSpeaking = useRef(false);
  const queueRef = useRef<string[]>([]);
  const podcastWaitingToResume = useRef(false);

  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    onFinish: async (response) => {
      const url = new URL("/api/tts", window.location.origin);
      url.searchParams.append("text", response.content);

      queueRef.current.push(url.href);

      function handleQueue() {
        if (isAssistantSpeaking.current) return;
        const next = queueRef.current.shift();

        if (!next) {
          if ((window as any).podcastWaitingToResume as boolean) {
            resumePodcast();
            (window as any).podcastPlaying = true;
            (window as any).podcastWaitingToResume = false;
          }
          return;
        }

        load(next, {
          autoplay: true,
          onplay: () => {
            isAssistantSpeaking.current = true;
          },
          onend: () => {
            isAssistantSpeaking.current = false;
            handleQueue();
          },

          format: "mp3",
        });
      }

      handleQueue();
    },
    initialMessages,
  });
  const { formRef, onKeyDown } = useEnterSubmit();

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const body = () => {
    return {
      position,
      duration,
      bytes,
      podcastId: id,
      audioUrl: src,
      transcription,
      transcribe: true,
    };
  };

  return (
    <div className="flex h-[calc(50vh)] max-h-[calc(50vh)] flex-col rounded-md border">
      <div className="h-full space-y-1 overflow-y-auto p-2">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={cn(message.role === "user" && "flex justify-end")}
          >
            <p
              className={cn(
                message.role === "user" ? "rounded-md border px-3 py-1" : "p-3",
              )}
            >
              {message.content}
            </p>
          </div>
        ))}
      </div>
      <form
        ref={formRef}
        onSubmit={async (event) => {
          event.preventDefault();

          handleSubmit(event, {
            options: {
              body: body(),
            },
          });
        }}
        className="flex items-end space-x-2 p-2"
      >
        <TextareaAutosize
          placeholder="Send a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          tabIndex={0}
          maxRows={3}
          className="flex h-9 w-full resize-none rounded-md bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex h-9 rounded-md border">
          <Button
            size="icon"
            className="aspect-square h-full"
            type="submit"
            variant="ghost"
          >
            <CornerDownLeft className="h-4 w-4" />
          </Button>
          <VoiceButton append={append} body={body} deepgramKey={deepgramKey} />
        </div>
      </form>
    </div>
  );
}
