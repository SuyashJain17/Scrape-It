"use client";

import { TaskParam, TaskParamType } from "@/types/task";
import { StringParam } from "./param/StringParam";
import { useReactFlow } from "@xyflow/react";
import { AppNode } from "@/types/appNode";
import { useCallback } from "react";

export function NodeParamField({param, nodeId}: {param: TaskParam, nodeId: string}) {
    const {updateNodeData, getNode} = useReactFlow();
    const node = getNode(nodeId) as AppNode;
    const value = node?.data.inputs[param.name as keyof typeof node.data.inputs];

    const updateNodeParamValue  = useCallback((newValue: string) => {
        updateNodeData(nodeId, {
            inputs: {
                ...node.data.inputs,
                [param.name]: newValue
            }
        })
    }, [nodeId, node?.data.inputs, updateNodeData, param.name]);

    switch (param.type) {
        case TaskParamType.STRING:
            return <StringParam param={param} value={value} updateNodeParamValue={updateNodeParamValue} />
        default:
            return (
                <div className="w-full">
                    <p className="text-xs text-muted-foreground">Not Implemented</p>
                </div>
            )
        }
}