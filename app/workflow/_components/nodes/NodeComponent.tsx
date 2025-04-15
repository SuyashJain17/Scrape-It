import { memo } from 'react';
import { NodeProps } from '@xyflow/react';

import NodeCard from './NodeCard';
import NodeHeader from './NodeHeader';
import { NodeInput, NodeInputs } from './NodeInputs';
import { NodeOutput, NodeOutputs } from './NodeOutputs';

import { TaskRegistry } from '@/lib/workflow/task/registry';
import { AppNodeData } from '@/types/appNode';
import { Badge } from '@/components/ui/badge';

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true"
const NodeComponent = memo((props: NodeProps) => {
  const nodeData = props.data as AppNodeData;
  const task = TaskRegistry[nodeData.type as keyof typeof TaskRegistry];

  return (
    <NodeCard nodeId={props.id} isSelected={!!props.selected}>
      {DEV_MODE && <Badge>DEV: {props.id}</Badge>}
      <NodeHeader taskType={nodeData.type} nodeId={props.id} />
      <NodeInputs>
        {task.inputs.map((input) => (
          <NodeInput key={input.name} input={input} nodeId={props.id} />
        ))}
      </NodeInputs>

      <NodeOutputs>
        {task.outputs.map((output) => (
          <NodeOutput key={output.name} output={output} />
        ))}
      </NodeOutputs>
    </NodeCard>
  );
});

export default NodeComponent;
NodeComponent.displayName = 'NodeComponent';