import * as Snowflake from "snowflake";
import { Edge, Node } from "./schema.ts";

const kv = await Deno.openKv(Deno.env.get("DATABASE_URL"));

function isMatch(
  object: Record<string, unknown>,
  source: Record<string, unknown>,
) {
  for (const [key, value] of Object.entries(source)) {
    if (object[key] !== value) {
      return false;
    }
  }

  return true;
}

type Query = {
  create?: Record<string, unknown>;
  data?: Record<string, unknown>;
  include?: true | Record<string, unknown>;
  select?: Record<string, unknown>;
  update?: Record<string, unknown>;
  where?: Record<string, unknown>;
};

const nodes = {
  async create({ data = {}, select, include }: Query = {}) {
    const id = (data?.id || Snowflake.generate()) as string;
    data.id = id;

    const { ok } = await kv.set(["nodes", id], data);
    if (!ok) {
      throw new Error("Can't save");
    }

    if (select) {
      if (include) {
        return data;
      }
    }
  },
  async delete({ where = {}, select, include }: Query = {}) {
    const { id } = where;
    if (!id) {
      return null;
    }

    await kv.delete(["nodes", id as string]);

    if (select) {
      if (include) {
        return where;
      }
    }
  },
  async findFirst({ where = {} }: Query = {}) {
    const { id, ...matcher } = where;
    const prefix = ["nodes", id as string].filter(Boolean);

    if (id) {
      const { value: node } = await kv.get<Node>(prefix);
      if (!node) {
        return node;
      }
      return isMatch(node, matcher) ? node : null;
    }

    for await (const { value } of kv.list<Node>({ prefix })) {
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
  },
};

const edges = {
  async create(
    { data = {}, select, include }: Query = {},
  ): Promise<Partial<Edge>> {
    const { sourceId, targetId } = data;

    const key = ["edges", sourceId as string, targetId as string];
    const { ok } = await kv.set(key, data);
    if (!ok) {
      throw new Error("Can't save");
    }

    // TODO:
    if (select) {
      return data;
    }

    // TODO:
    if (include) {
      return data;
    }

    return data;
  },
  async delete(
    { where = {}, select, include }: Query = {},
  ): Promise<Partial<Edge> | null> {
    const { sourceId, targetId } = where;
    if (!sourceId && !targetId) {
      return null;
    }

    await kv.delete(["edges", sourceId as string, targetId as string]);

    if (select) {
      return where;
    }

    if (include) {
      return where;
    }

    return where;
  },
  async findFirst({ where = {} }: Query = {}): Promise<Partial<Edge> | null> {
    const { sourceId, targetId, ...matcher } = where;
    if (sourceId) {
      const key = ["edges", sourceId as string, targetId as string].filter(
        Boolean,
      );
      const { value: edge } = await kv.get<Edge>(key);
      if (!edge) {
        return edge;
      }
      return isMatch(edge, matcher) ? edge : null;
    }

    // No `sourceId` provided, so we retrieve all edges and match them.
    for await (
      const { key, value: edge } of kv.list<Edge>({ prefix: ["edges"] })
    ) {
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
  async findMany({ where = {} }: Query = {}): Promise<Edge[]> {
    const { sourceId, targetId, ...matcher } = where;
    const prefix = ["edges", sourceId as string, targetId as string].filter(
      Boolean,
    );
    const results = [];
    for await (const { value } of kv.list<Edge>({ prefix })) {
      if (isMatch(value, matcher)) {
        results.push(value);
      }
    }
    return results;
  },
  async upsert(
    { create, update, where, select, include }: Query = {},
  ): Promise<Partial<Edge>> {
    const item = await this.findFirst({ where, include, select });
    if (!item) {
      return this.create({ data: create, select, include });
    }

    if (update) {
      Object.assign(item, update);
      return this.create({ data: item, select, include });
    }

    return item;
  },
};

export const db = {
  nodes,
  edges,
};

/**
 * Recursively gets
 * @param sourceId
 * @returns
 */
export async function getTree(sourceId: string): Promise<Node | null> {
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
    // @ts-ignore extra property
    edge.source = node;
    // @ts-ignore extra property
    edge.target = await getTree(edge.targetId);
  }

  // @ts-ignore extra property
  node.edges = edges;

  return node;
}
