import { useSession } from 'next-auth/react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { ProfileImage } from './ProfileImage';

function updateTextAreaSize(textArea?: HTMLTextAreaElement | null) {
  if (!textArea) return;
  textArea.style.setProperty('height', '0');
  textArea.style.setProperty('height', `${textArea.scrollHeight}px`);
}

function Form() {
  const session = useSession();
  const [inputValue, setInputValue] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  if (session.status !== 'authenticated') return null;

  return (
    <form className="flex flex-col gap-2 border-b px-4 py-2">
      <div className="flex gap-4">
        <ProfileImage src={session.data.user.image} />
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{ height: 0 }}
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
          placeholder="What's happening?"
        />
      </div>
      <Button className="self-end" />
    </form>
  );
}

export function NewPostForm() {
  const session = useSession();
  if (session.status !== 'authenticated') return null;
  return <Form />;
}
