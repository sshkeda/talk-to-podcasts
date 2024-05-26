import {
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";
import { useEffect, useRef, useState } from "react";

export function useDeepgram({
  silenceDelay,
  key,
  onTranscript,
}: {
  silenceDelay: number;
  key: string;
  onTranscript: (data: LiveTranscriptionEvent) => void;
}) {
  const [connectionState, setConnectionState] = useState(
    LiveConnectionState.CONNECTING,
  );
  const connectionRef = useRef<LiveClient | null>(null);
  const keepAliveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const deepgram = createClient(key);

    const connection = deepgram.listen.live({
      model: "nova-2",
      language: "en-US",
      smart_format: true,
      filler_words: true,
      endpointing: silenceDelay,
    });

    connection.addListener(LiveTranscriptionEvents.Open, () => {
      setConnectionState(LiveConnectionState.OPEN);
    });
    connection.addListener(LiveTranscriptionEvents.Close, () => {
      setConnectionState(LiveConnectionState.CLOSED);
    });

    connectionRef.current = connection;

    connectionRef.current.addListener(
      LiveTranscriptionEvents.Transcript,
      onTranscript,
    );

    keepAliveRef.current = setInterval(() => {
      if (connection.getReadyState() === 1) connectionRef.current?.keepAlive();
    }, 10_000);

    return () => {
      keepAliveRef.current && clearInterval(keepAliveRef.current);
      connectionRef.current?.removeAllListeners();
      if (connectionRef.current?.getReadyState() === 1) {
        connectionRef.current?.finish();
      }
    };

    // What's a hackathon if you're not hacking?
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState, key, silenceDelay]);

  const onData = ({ data }: BlobEvent) =>
    connectionRef.current?.getReadyState() === 1
      ? connectionRef.current.send(data)
      : null;

  return {
    connectionState: LiveConnectionState[
      connectionState
    ] as keyof typeof LiveConnectionState,
    connection: connectionRef.current,
    onData,
  };
}
