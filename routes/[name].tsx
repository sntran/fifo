import { Head } from "$fresh/runtime.ts";
import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";

import Tree from "../islands/Tree.tsx";

export const handler: Handlers = {
  // Displays the FIFO editor.
  async GET(request: Request, context: HandlerContext) {
    const response = await context.render({
      nodes: [],
    });

    return response;
  },
}

export default function FIFO({ params, data }: PageProps) {
  const name = params.name;

  return (
    <>
      <Head>
        <title>{name} FIFO</title>
      </Head>

      <main
        class="
          mx-auto max-w-screen-md
          p-6
          text-white bg-[#2D2E2C]
          rounded
        "
      >
        <h1 class="text-4xl font-bold mb-8">/{name}</h1>

        <Tree root={`/${name}`} nodes={data.nodes} />
      </main>
    </>
  );
}
