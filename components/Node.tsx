import { Button } from "./Button.tsx";

export interface Node {
  id: string;
  from: string;
  url: string;
  method?: string;
}

export function Node(props: Node) {
  const { id, from, url, method = "POST" } = props;

  return (
    <form
      method="POST"
      encType="multipart/form-data"
      class="inline-flex gap-4"
    >
      <input type="hidden" name="node[id]" value={id} />
      <input type="hidden" name="node[from]" value={from} />

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

      <div>
        <Button
          type="submit"
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
  );
}
