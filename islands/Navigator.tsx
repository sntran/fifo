import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

interface NavigatorProps {
  placeholders: string[];
}

export default function Navigator({ placeholders }: NavigatorProps) {
  const randomIndex = Math.floor(Math.random() * placeholders.length);
  const [placeholder, setPlaceholder] = useState(placeholders[randomIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * placeholders.length);
      setPlaceholder(placeholders[randomIndex]);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <form method="GET" class="flex gap-2 w-full">
      <label class="flex flex-row-reverse">
        <input
          type="text"
          name="name"
          required={true}
          placeholder={placeholder}
          class="bg-transparent border-b"
        />
        <span>{globalThis.location?.origin}/</span>
      </label>

      <Button type="submit">Go</Button>
    </form>
  );
}
