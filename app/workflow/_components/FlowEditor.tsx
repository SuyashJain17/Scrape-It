import { Workflow } from "@/lib/generated/prisma";
import { createFlowNode } from "@/lib/workflow/createFlowNode";
import { TaskType } from "@/types/task";
import { Background, ReactFlow, useEdgesState, useNodesState, BackgroundVariant, Controls} from "@xyflow/react";
import NodeComponent from "./nodes/NodeComponent";

const nodeTypes = {
    FlowScrapeNode: NodeComponent
}

const snapGrid: [number, number] = [50, 50];
const fitViewOptions = {padding: 1};

function FlowEditor({workflow}: {workflow: Workflow}) {
   const [nodes, setNodes, onNodesChange] = useNodesState([
    createFlowNode(TaskType.LAUNCH_BROWSER),
   ])
   const [edges, setEdges, onEdgesChange] = useEdgesState([])
   
   return (
    <main className="h-full w-full" >
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            snapToGrid
            snapGrid={snapGrid}
            fitView
        >
            <Controls position="top-left" fitViewOptions={fitViewOptions}/>
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
    </main>
    );
}

export default FlowEditor;