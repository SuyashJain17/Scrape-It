import { Workflow } from "@/lib/generated/prisma";
import {
    Background,
    ReactFlow,
    useEdgesState,
    useNodesState,
    BackgroundVariant,
    Controls,
    useReactFlow,
    Connection,
    Edge,
    addEdge,
    getOutgoers,
} from "@xyflow/react";
import NodeComponent from "./nodes/NodeComponent";
import { useCallback, useEffect } from "react";
import { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";
import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import DeletableEdge from "./edges/deletableEdge";
import { TaskRegistry } from "@/lib/workflow/task/registry";

const nodeTypes = {
    FlowScrapeNode: NodeComponent,
};

const edgeTypes = {
    default: DeletableEdge,
};

const snapGrid: [number, number] = [50, 50];
const fitViewOptions = { padding: 1 };

function FlowEditor({ workflow }: { workflow: Workflow }) {
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();
    useEffect(() => {
        try {
            const flow = JSON.parse(workflow.definition);
            if (!flow) return;
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            if (!flow.viewport) return;
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            setViewport({ x, y, zoom });
        } catch (error) { }
    }, [workflow.definition, setNodes, setEdges, setViewport]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const taskType = event.dataTransfer.getData("application/reactflow");
            if (typeof taskType === undefined || !taskType) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = CreateFlowNode(taskType as TaskType, position);
            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes]
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
            if (!connection.targetHandle) return;

            const node = nodes.find((nd) => nd.id === connection.target);
            if (!node) return;

            const nodeInputs = node.data.inputs;
            updateNodeData(node.id, {
                inputs: {
                    ...nodeInputs,
                    [connection.targetHandle]: "",
                },
            });
        },
        [setEdges, updateNodeData, nodes]
    );

    const isValidConnection = useCallback(
        (connection: Edge | Connection) => {
            // Self-connection not allowed
            if (connection.source === connection.target) {
                return false;
            }

            // Same taskParam type connection not allowed
            const source = nodes.find((node) => node.id === connection.source);
            const target = nodes.find((node) => node.id === connection.target);
            if (!source || !target) {
                console.error("Invalid connection: source or target node not found");
                return false;
            }

            const sourceTask =
                TaskRegistry[source.data.type as keyof typeof TaskRegistry];
            const targetTask =
                TaskRegistry[target.data.type as keyof typeof TaskRegistry];

            const output = sourceTask.outputs.find(
                (o) => o.name === connection.sourceHandle
            );
            const input = targetTask.inputs.find(
                (i) => i.name === connection.targetHandle
            );

            if (input?.type !== output?.type) {
                console.error("Invalid connection: Type mismatch");
                return false;
            }

            // Cycle connection not allowed
            const hasCycle = (node: AppNode, visited = new Set()) => {
                if (visited.has(node.id)) return false;
                visited.add(node.id);

                for (const outgoer of getOutgoers(node, nodes, edges)) {
                    if (outgoer.id === connection.source) return true;
                    if (hasCycle(outgoer, visited)) return true;
                }
            };

            const detectedCycle = hasCycle(target);

            return !detectedCycle;
        },
        [nodes, edges]
    );

    return (
        <main className="h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                snapToGrid
                snapGrid={snapGrid}
                fitView
                onDragOver={onDragOver}
                onDrop={onDrop}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
            >
                <Controls position="top-left" fitViewOptions={fitViewOptions} />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </main>
    );
}

export default FlowEditor;
