"use client";

import { useGlobalAudioPlayer } from "react-use-audio-player";
import { Slider } from "@/components/ui/slider";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useAudioTime } from "@/lib/hooks/use-audio-time";
import { Skeleton } from "./ui/skeleton";

const formatSeconds = (t: number) =>
  `${Math.floor(t / 60)}:${Math.floor(t % 60)
    .toString()
    .padStart(2, "0")}`;

export default function AudioPlayer({ src }: { src: string }) {
  const { load, playing, play, pause, isReady, seek, duration } =
    useGlobalAudioPlayer();
  const position = useAudioTime();
  useEffect(() => {
    load(src, {
      format: "mp3",
      html5: true,
    });
  }, [load, src]);

  if (!isReady) return <Skeleton className="h-[122px] w-[1024px]" />;
  return (
    <div className="rounded-md border px-6 py-2 pb-3">
      <div className="flex justify-center space-x-1.5">
        <div className="space-x-1.5">
          <Button
            onClick={() => {
              seek(position - 5);
            }}
            variant="ghost"
            size="icon"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          {playing ? (
            <Button
              onClick={() => {
                (window as any).podcastPlaying = false;
                pause();
              }}
              variant="ghost"
              size="icon"
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                (window as any).podcastPlaying = true;
                play();
              }}
              variant="ghost"
              size="icon"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          onClick={() => {
            seek(position + 5);
          }}
          variant="ghost"
          size="icon"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
      <Slider
        value={[position]}
        max={duration}
        step={1}
        className="mt-3 w-full"
        onValueChange={(position) => seek(position[0])}
      />
      <div className="mt-3 flex justify-between">
        <p className="text-muted-foreground">{formatSeconds(position)}</p>
        <p className="text-muted-foreground">{formatSeconds(duration)}</p>
      </div>
    </div>
  );
}
