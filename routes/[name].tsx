import { Head } from "$fresh/runtime.ts";
import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { reform } from "https://deno.land/x/reformdata@0.2.2/mod.ts";

import { Edge } from "../lib/schema.ts";
import { db, getTree } from "../lib/db.ts";
import Tree from "../islands/Tree.tsx";

export const handler: Handlers = {
  // Displays the FIFO editor.
  async GET(request: Request, context: HandlerContext) {
    const { pathname } = new URL(request.url);

    const fifo = await db.nodes.upsert({
      where: { id: pathname },
      create: { id: pathname, url: pathname, method: "POST" },
    })

    const tree = await getTree(pathname);

    const response = await context.render(tree);

    return response;
  },

  // Partially updates the FIFO.
  async PATCH(request: Request) {
    const { pathname } = new URL(request.url);

    const { _action: action, edge } = reform(await request.formData());
    const { sourceId, targetId, target } = edge as Edge;
    const rel = { sourceId, targetId };
    target.id = targetId;

    if (action === "upsert") {

      await db.nodes.upsert({
        where: { id: targetId },
        create: target,
        update: target,
      });

      await db.edges.upsert({
        where: rel,
        create: rel,
        update: rel,
      });

    } else if (action === "delete") {

      await db.edges.delete({
        where: rel
      });

      await db.nodes.delete({
        where: { id: targetId },
      });

    }

    return new Response(null, {
      status: 204,
    });
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

        <Tree {...data} />
      </main>
    </>
  );
}
