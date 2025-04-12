"use client";

import { TaskParam, TaskParamType } from "@/types/task";
import { StringParam } from "./node/StringParam";
import { useReactFlow } from "@xyflow/react";

export function NodeParamField({param}: {param: TaskParam}) {
    const {upadteNodeData} = useReactFlow();
    
    switch (param.type) {
        case TaskParamType.STRING:
            return <StringParam 
                param={ param } 
                value={param.value} 
                updateNodeParamValue={(newValue) => {
                    param.value = newValue;
                }}
            />
        default:
            return (
                <div className="w-full">
                    <p className="text-xs text-muted-foreground">Not Implemented</p>
                </div>
            )
        }
}