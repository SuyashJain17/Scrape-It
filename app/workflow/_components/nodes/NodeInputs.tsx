import { cn } from "@/lib/utils";
import { TaskParam } from "@/types/task";
import { Position, useEdges } from "@xyflow/react";
import { Handle } from "@xyflow/react";
import  NodeParamField  from "./NodeParamField";
import { ColorForHandle } from "./common";
import useFlowValidation from "@/components/hooks/useFlowValidation";

export function NodeInputs({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col divide-y gap-2">{children}</div>;
}

export function NodeInput({
  input,
  nodeId,
}: {
  input: TaskParam;
  nodeId: string;
}) {
  const {invalidInputs} = useFlowValidation();
  const edges = useEdges();
  const isConnected = edges.some((edge) => edge.target === nodeId && edge.targetHandle === input.name);
  const  hasError = (invalidInputs || [])
    .find((node) => node.nodeId === nodeId)
    ?.inputs.find((invalidInputs) => invalidInputs === input.name)

  return (
    <div 
      className={cn(
        "flex justify-start relative p-3 bg-secondary w-full",
        hasError && "bg-destructive/30"
      )}
    >
      <NodeParamField param={input} nodeId={nodeId} disabled={isConnected}/>
      {!input.hideHandle && (
        <Handle
          id={input.name}
          isConnectable={!isConnected}
          type="target"
          position={Position.Left}
          className={cn(
            "!absolute !-left-2 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !bg-muted-foreground !border-2 !border-background",
            ColorForHandle[input.type as keyof typeof ColorForHandle]
          )}
        />
      )}
    </div>
  );
}
