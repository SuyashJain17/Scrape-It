import { TaskRegistry } from '@/lib/workflow/task/registry';
import { AppNode } from '@/types/appNode';

export function calculateWorkflowCost(nodes: AppNode[]) {
  return nodes.reduce((acc, node) => {
    return acc + TaskRegistry[node.data.type].credits;
  }, 0);
}