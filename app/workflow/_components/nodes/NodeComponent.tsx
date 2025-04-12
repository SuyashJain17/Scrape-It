import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import NodeCard from "./NodeCard";
import NodeHeader from "./NodeHeader";
import { AppNodeData } from "@/types/appNode";
import { TaskParamType } from "@/types/task";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { NodeInput, NodeInputs } from "./NodeInputs";

const NodeComponent = memo ((props: NodeProps) => {
    const nodeData = props.data as AppNodeData;
    const task = TaskRegistry[nodeData.type as keyof typeof TaskRegistry];
    return(
        <NodeCard nodeId={props.id} isSelected={!!props.selected}>
        <NodeHeader taskType={nodeData.type} nodeId={props.id}/>
        <NodeInputs>
            {task.inputs.map((input) => (
                <NodeInput key={input.name} input={input} />
            ))}
        </NodeInputs>
        </NodeCard>
    )
})

export default NodeComponent;
NodeComponent.displayName = "NodeComponent";