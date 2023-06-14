import { type Node } from "../lib/schema.ts";

import { useComputed, useSignal, signal } from "@preact/signals";
import { Button } from "./Button.tsx";

const loading = signal(false);

// Reloads the page after a successfull submission.
async function save(event: Event) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
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

export function TreeNode(props: Node) {
  const { id, parentId, url, method = "POST" } = props;

  return (
    <>
      <form
        method="POST"
        encType="multipart/form-data"
        class="inline-flex gap-4"
        onSubmit={save}
      >
        {/* Override submit method for our handler to update the FIFO */}
        <input type="hidden" name="_method" value="PATCH" />

        <input type="hidden" name="node[id]" value={id} />
        <input type="hidden" name="node[parentId]" value={parentId} />

        <label>
          <select
            name="node[method]"
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
            name="node[url]"
            value={url}
            placeholder="https://***.deno.dev"
            class="bg-transparent border-b"
          />
        </label>

        <div class="flex gap-2">
          <Button
            type="submit"
            disabled={loading}
            class="
              px-2 py-1
              text-white bg-blue-600
              rounded shadow
              disabled:opacity-50 disabled:cursor-wait
            "
          >
            Save
          </Button>
        </div>
      </form>

      <form
        action={`?id=${id}`}
        method="DELETE"
        class="inline-flex"
        onSubmit={save}
      >
        <input type="hidden" name="_method" value="DELETE" />
        <button type="submit" class="text-red-600">Delete</button>
      </form>
    </>
  );
}
