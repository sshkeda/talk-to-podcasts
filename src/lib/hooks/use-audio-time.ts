import { useEffect, useRef, useState } from "react";
import { useGlobalAudioPlayer } from "react-use-audio-player";

// https://www.npmjs.com/package/react-use-audio-player#recipe-syncing-react-state-to-live-audio-position
export function useAudioTime() {
  const frameRef = useRef<number>();
  const [position, setPosition] = useState(0);
  const { getPosition } = useGlobalAudioPlayer();

  useEffect(() => {
    function animate() {
      setPosition(getPosition());
      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [getPosition]);

  return position;
}
