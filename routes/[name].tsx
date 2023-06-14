import { Head } from "$fresh/runtime.ts";
import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { reform } from "https://deno.land/x/reformdata@0.2.2/mod.ts";

import { getNodes, upsertNode, deleteNode } from "../lib/db.ts";
import Tree from "../islands/Tree.tsx";

export const handler: Handlers = {
  // Displays the FIFO editor.
  async GET(request: Request, context: HandlerContext) {
    const { pathname } = new URL(request.url);
    const nodes = await getNodes(pathname);
    const response = await context.render({
      nodes,
    });

    return response;
  },

  // Partially updates the FIFO.
  async PATCH(request: Request) {
    const { pathname } = new URL(request.url);

    const formData = reform(await request.formData());

    const node = await upsertNode(formData["node"]);

    return new Response(null, {
      status: 204,
    });
  },

  async DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return new Response(null, {
        status: 400,
      });
    }

    await deleteNode(id);
    return new Response(null, {
      status: 204,
    });
  }
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
