'use client'
import { Workflow } from "@/lib/generated/prisma";
import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from "./FlowEditor";
import { TopBar } from "./topbar/TopBar";
import TaskMenu from "./TaskMenu";
import {FlowValidationContextProvider} from "@/components/context/FlowValidationContext";

function Editor({workflow}: {workflow: Workflow}) {
    return (
        <FlowValidationContextProvider>
            <ReactFlowProvider>
                <div className="flex flex-col h-full w-full overflow-hidden">
                    <TopBar title="Workflow editor" subtitle={workflow.name} workflowId={workflow.id}/>
                    <section className="flex h-full w-full overflow-auto">
                        <TaskMenu />
                        <FlowEditor workflow={workflow} />
                    </section>
                </div>
            </ReactFlowProvider>
        </FlowValidationContextProvider>
    )
}

export default Editor;