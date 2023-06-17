import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

export const Node = z.object({
  id: z.string().describe("primary, unique"),
  name: z.string().optional(),
  description: z.string().optional(),
  url: z.string(),
  method: z.string().optional(),
});

export type Node = z.infer<typeof Node>;

export const Edge = z.object({
  type: z.string().optional(),
  sourceId: z.string().describe("index"),
  targetId: z.string().describe("index"),
});

export type Edge = z.infer<typeof Edge>;
