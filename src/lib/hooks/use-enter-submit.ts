import { useRef, type RefObject } from "react";

// https://github.com/vercel/ai-chatbot/blob/main/lib/hooks/use-enter-submit.tsx
export function useEnterSubmit(): {
  formRef: RefObject<HTMLFormElement>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
} {
  const formRef = useRef<HTMLFormElement>(null);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      formRef.current?.requestSubmit();
      event.preventDefault();
    }
  }

  return { formRef, onKeyDown: handleKeyDown };
}
