import * as Snowflake from "https://deno.land/x/deno_snowflake@v1.0.1/snowflake.ts";

import { Branch } from "../components/Branch.tsx";
import { type Edge, type Node } from "../lib/schema.ts";

interface TreeProps extends Node {
  edges: Array<Edge & {
    source: TreeProps,
    target: TreeProps,
  }>
}

export default function Tree(node: TreeProps) {
  const liClass = `
    my-4
    pl-12 border-l last:border-l-transparent
    relative
    before:absolute before:-top-3 before:-left-px
    before:w-6 before:h-6
    before:border-l before:border-b

    after:absolute after:top-3 after:left-3
    after:-translate-y-1/2
    after:w-6 after:h-6
    after:rounded-full
    after:bg-gray-200
  `;

  const newNode = {id: Snowflake.generate(), url: "", edges: []};
  const newEdge = {
    sourceId: node.id,
    targetId: newNode.id,
    source: node,
    target: newNode,
  }

  return (
    <ul class="">
      {node.edges.map((edge, index) => (
        // Without a key, Preact has to guess which elements have
        // changed when re-rendering.
        <li
          key={index}
          class={liClass}
        >
          <details open={true} class="group">
            <summary
              class="
                flex gap-4
                before:absolute before:top-3 before:left-3
                before:-translate-y-1/2
                before:w-6 before:h-6
                before:rounded-full

                marker:content-none cursor-pointer
                before:content-['+'] before:group-open:content-['-']
                before:z-10 before:text-white before:text-center
                before:bg-green-500
              "
            ><Branch {...edge} /></summary>

            <Tree {...edge.target!}></Tree>
          </details>
        </li>
      ))}

      <li class={"flex gap-4 " + liClass}>
        <Branch {...newEdge} />
      </li>
    </ul>
  );
}
