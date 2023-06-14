import { TreeNode } from "../components/TreeNode.tsx";
import { type Node } from "../lib/schema.ts";

interface TreeProps {
  root: string;
  nodes?: Node[];
}

export default function Tree({ root, nodes = [] }: TreeProps) {
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

  return (
    <ul class="">
      {nodes.map((node, index) => (
        // Without a key, Preact has to guess which elements have
        // changed when re-rendering.
        <li
          key={index}
          class={liClass}
        >
          <details open={true} class="group">
            <summary
              class="
                before:absolute before:top-3 before:left-3
                before:-translate-y-1/2
                before:w-6 before:h-6
                before:rounded-full

                marker:content-none cursor-pointer
                before:content-['+'] before:group-open:content-['-']
                before:z-10 before:text-white before:text-center
                before:bg-green-500
              "
            ><TreeNode {...node} /></summary>

            <Tree root={node.id}></Tree>
          </details>
        </li>
      ))}

      <li class={liClass}>
        <TreeNode id={crypto.randomUUID()} parentId={root} url="" />
      </li>
    </ul>
  );
}
