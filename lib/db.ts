import * as Snowflake from "https://deno.land/x/deno_snowflake@v1.0.1/snowflake.ts";
import { Node, Edge } from "./schema.ts";

const kv = await Deno.openKv();

function isMatch(object: Record<string, unknown>, source: Record<string, unknown>) {
  for (const [key, value] of Object.entries(source)) {
    if (object[key] !== value) {
      return false;
    }
  }

  return true;
}

type Query = {
  create?: Record<string, unknown>,
  data?: Record<string, unknown>,
  include?: true | Record<string, unknown>,
  select?: Record<string, unknown>,
  update?: Record<string, unknown>,
  where?: Record<string, unknown>,
}

const nodes = {
  async create({ data = {}, select, include }: Query = {}) {
    const id = data.id || Snowflake.generate();
    data.id = id;

    const { ok } = await kv.set(["nodes", id], data);
    if (!ok) {
      throw new Error("Can't save");
    }

    return data;
  },
  async delete({ where = {}, select, include }: Query = {}) {
    const { id } = where;
    if (!id) {
      return null;
    }

    await kv.delete(["nodes", id]);
  },
  async findFirst({ where = {} }: Query = {}) {
    const { id, ...matcher } = where;
    if (id) {
      const { value: node } = await kv.get<Node>(["nodes", id]);
      if (!node) {
        return node;
      }
      return isMatch(node, matcher) ? node : null;
    }

    for await (const { value } of kv.list<Node>(["nodes"])) {
      if (isMatch(value, matcher)) {
        return value;
      }
    }

    return null;
  },
  async upsert({ create, update, where, select, include }: Query = {}) {
    const item = await this.findFirst({ where, include, select });
    if (!item) {
      return this.create({ data: create, select, include });
    }

    if (update) {
      Object.assign(item, update);
      return this.create({ data: item, select, include });
    }

    return item;
  }
}

const edges = {
  async create({ data = {}, select, include }: Query = {}) {
    const { sourceId, targetId } = data;

    const key = ["edges", sourceId, targetId];
    const { ok } = await kv.set(key, data);
    if (!ok) {
      throw new Error("Can't save");
    }

    return data;
  },
  async delete({ where = {}, select, include }: Query = {}) {
    const { sourceId, targetId } = where;
    if (!sourceId && !targetId) {
      return null;
    }

    await kv.delete(["edges", sourceId, targetId]);
  },
  async findFirst({ where = {} }: Query = {}) {
    const { sourceId, targetId, ...matcher } = where;
    if (sourceId) {
      const key = ["edges", sourceId, targetId].filter(Boolean);
      const { value: edge } = await kv.get<Edge>(key);
      if (!edge) {
        return edge;
      }
      return isMatch(edge, matcher) ? edge : null;
    }

    // No `sourceId` provided, so we retrieve all edges and match them.
    for await (const { key, value: edge } of kv.list<Edge>(["edges"])) {
      // If `targetId` is provided, check if the key contains it.
      if (targetId && key[2] !== targetId) {
        continue;
      }

      if (isMatch(edge, matcher)) {
        return edge;
      }
    }

    return null;
  },
  async findMany({ where = {} }: Query = {}) {
    const { sourceId, targetId, ...matcher } = where;
    const prefix = ["edges", sourceId, targetId].filter(Boolean);
    const results = [];
    for await (const { key, value } of kv.list<Edge>({ prefix })) {
      if (isMatch(value, matcher)) {
        results.push(value);
      }
    }
    return results;
  },
  async upsert({ create, update, where, select, include }: Query = {}) {
    const item = await this.findFirst({ where, include, select });
    if (!item) {
      return this.create({ data: create, select, include });
    }

    if (update) {
      Object.assign(item, update);
      return this.create({ data: item, select, include });
    }

    return item;
  }
}

export const db = {
  nodes,
  edges,
}

/**
 * Recursively gets
 * @param sourceId
 * @returns
 */
export async function getTree(sourceId: string): Promise<Node> {
  const node = await db.nodes.findFirst({
    where: { id: sourceId },
  });

  if (!node) {
    return node;
  }

  const edges = await db.edges.findMany({
    where: { sourceId },
  });

  for await (const edge of edges) {
    edge.source = node;
    edge.target = await getTree(edge.targetId);
  }

  node.edges = edges;

  return node;
}

export async function deleteNode(id: string) {
  const node = await getNode(id);

  return kv.atomic()
    .delete(["nodes", node.parentId, "pipe", id])
    .delete(["nodes", id])
    .commit();
}
