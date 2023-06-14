import { Node } from "./schema.ts";

const kv = await Deno.openKv();

// await deleteNodes();

export async function getNode(id: string) {
  const { value } = await kv.get<Node>(["nodes", id]);
  return value;
}

export async function getNodes(parentId: string, _options = {}) {
  const prefix = ["nodes", parentId];
  const nodes = [];
  for await (const { key, value } of kv.list<Node>({ prefix })) {
    const [, , type, id] = key;
    nodes.push(await getNode(id));
  }

  return nodes;
}

export async function upsertNode(data: Node) {
  const { ok } = await kv.atomic()
    .set(["nodes", data.id], data)
    .set(["nodes", data.parentId, "pipe", data.id], {})
    .commit();

  if (ok) {
    return data;
  }
}
