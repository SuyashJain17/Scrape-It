'use client'
import { Workflow } from "@/lib/generated/prisma";
import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from "./FlowEditor";
import { TopBar } from "./topbar/TopBar";
import TaskMenu from "./TaskMenu";

function Editor({workflow}: {workflow: Workflow}) {
    return (
        <ReactFlowProvider>
            <div className="flex flex-col h-full w-full overflow-hidden">
                <TopBar title="Workflow editor" workflowId={workflow.id}/>
                <section className="flex h-full w-full overflow-auto">
                    <TaskMenu />
                    <FlowEditor workflow={workflow} />
                </section>
            </div>
        </ReactFlowProvider>
    )
}

export default Editor;