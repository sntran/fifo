import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class=""
    >
      <kbd class="
          flex justify-center items-center
          w-5
          text-[#969faf]
          rounded-sm shadow-button
        ">
        ↵
      </kbd>
    </button>
  );
}
