import { type Edge, type Node } from "../lib/schema.ts";

import { useComputed, useSignal, signal } from "@preact/signals";
import { Button } from "./Button.tsx";

const loading = signal(false);

// Reloads the page after a successfull submission.
async function save(event: SubmitEvent) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form, event.submitter);
  const method = formData.get("_method") as string || form.method;

  loading.value = true;

  const response = await fetch(form.action, {
    method,
    body: formData,
  });

  if (response.ok) {
    location.reload();
    loading.value = false;
  }
}

interface BrandProps extends Edge {
  source: Node,
  target: Node,
}

export function Branch(props: BrandProps) {
  const { source, target: { id, url, method = "POST"} } = props;

  return (
    <form
      method="POST"
      encType="multipart/form-data"
      class="inline-flex gap-4"
      onSubmit={save}
    >
      {/* Override submit method for our handler to update the FIFO */}
      <input type="hidden" name="_method" value="PATCH" />

      <input type="hidden" name="edge[sourceId]" value={source.id} />
      <input type="hidden" name="edge[targetId]" value={id} />

      <label>
        <select
          name="edge[target][method]"
          value={method}
          class="appearance-none bg-transparent"
        >
          <option value="POST">POST</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
          <option value="PUT">PUT</option>
        </select>
      </label>

      <label class="inline-flex flex-row-reverse gap-x-2 items-center">
        <input
          type="text"
          name="edge[target][url]"
          value={url}
          placeholder="https://***.deno.dev"
          class="bg-transparent border-b"
        />
      </label>

      <div class="flex gap-2">
        <button
          type="submit"
          name="_action" value="upsert"
          disabled={loading}
          class="
            disabled:opacity-50 disabled:cursor-wait
          "
        >💾</button>

        <button
          type="submit"
          name="_action" value="delete"
          class="text-red-600"
        >🗑</button>
      </div>
    </form>
  );
}
