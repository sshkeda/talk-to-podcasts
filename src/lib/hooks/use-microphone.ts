import { useCallback, useEffect, useRef, useState } from "react";

export function useMicrophone({
  timeslice,
  onData,
}: {
  timeslice: number;
  onData: (data: BlobEvent) => void;
}) {
  const [microphoneState, setMicrophoneState] = useState<
    "loading" | "ready" | "recording" | "paused" | "error"
  >("loading");
  const microphoneRef = useRef<MediaRecorder | null>(null);

  // Hacky way because useEffectEvent is still experimental
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onDataEvent = useCallback(onData, []);

  const setupMicrophone = useCallback(async () => {
    if (microphoneRef.current) return microphoneRef.current;
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      setMicrophoneState("ready");
      const microphone = new MediaRecorder(userMedia);
      microphoneRef.current = microphone;

      microphone.addEventListener("dataavailable", onDataEvent);

      return microphone;
    } catch (error) {
      setMicrophoneState("error");
    }

    return () => {
      if (microphoneRef.current) {
        microphoneRef.current.removeEventListener("dataavailable", onDataEvent);
        microphoneRef.current = null;
      }
    };
  }, [onDataEvent]);

  async function startListening() {
    if (!microphoneRef.current) return;
    if (microphoneState === "ready") {
      microphoneRef.current.start(timeslice);
      setMicrophoneState("recording");
    } else if (microphoneState === "paused") {
      microphoneRef.current.resume();
      setMicrophoneState("recording");
    }
  }

  async function stopListening() {
    if (!microphoneRef.current) return;
    if (microphoneState === "recording") {
      microphoneRef.current.pause();
      setMicrophoneState("paused");
    }
  }

  useEffect(() => {
    setupMicrophone();
  }, [setupMicrophone]);

  return { startListening, stopListening, microphoneState };
}
