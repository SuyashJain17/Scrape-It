import "server-only"
import { prisma } from "../prisma"
import { revalidatePath } from "next/cache";
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from "@/types/workflow";
import { ExecutionPhase } from "@prisma/client";
import { AppNode } from "@/types/appNode";
import { TaskRegistry } from "./task/registry";
import { ExecutorRegistry } from "./executer/registry";
import { Environment, ExecutionEnvironment } from "@/types/executor";



export async function ExecuteWorkflow(executionId: string) {
    const execution = await prisma.workflowExecution.findUnique({
        where: {id: executionId},
        include: {workflow: true, phases: true},
    });
    if(!execution) {
        throw new Error("execution not found")
    }

    const environment: Environment = {phases: {}}

    await initialWorkflowExecution(executionId, execution.workflowId);
    await initialPhaseStatuses(execution);

    let creditsConsumed = 0;
    let executionFailed = false;
    for(const phase of execution.phases) {
        //TODO: consume credits
        const phaseExecution = await executeWorkflowPhase(phase, environment)
        if(!phaseExecution) {
            executionFailed = true;
            break;
        }
    }

    await finalizeWorkflowExecution(
        executionId,
        execution.workflowId,
        executionFailed,
        creditsConsumed
    ) 
    //TODO: clean up environment

    revalidatePath("/workflows/runs")
}

async function initialWorkflowExecution(executionId: string, workflowId: string) {
    await prisma.workflowExecution.update({
        where: {id: executionId},
        data: {
            startedAt: new Date(),
            status: WorkflowExecutionStatus.RUNNING,
        }
    })
    
    await prisma.workflow.update({
        where: { id: workflowId },
        data: {
            lastRunAt: new Date(),
            lastRunStatus: WorkflowExecutionStatus.RUNNING,
            lastRunId: executionId
        }
    })
}

async function initialPhaseStatuses(execution: any) {
    await prisma.executionPhase.updateMany({
        where: {
            id: {
                in: execution.phase.map((phase: any) => phase.id),
            },
        },
        data: {
            status: ExecutionPhaseStatus.PENDING
        }
    })
}

async function finalizeWorkflowExecution(
    executionId: string,
    workflowId: string,
    executionFailed: boolean,
    creditsConsumed: number
) {
    const finalStatus = executionFailed
        ? WorkflowExecutionStatus.FAILED
        : WorkflowExecutionStatus.COMPLETED

    await prisma.workflowExecution.update({
        where: {id: executionId},
        data: {
            status: finalStatus,
            completedAt: new Date(),
            creditsConsumed,
        },
    });

    await prisma.workflow.update({
        where: {
            id: workflowId,
            lastRunId: executionId
        }, 
        data: {
            lastRunStatus: finalStatus
        }
    })
    .catch((err) => {

    })
}

async function executeWorkflowPhase(phase: ExecutionPhase, environment: Environment) {
    const startedAt = new Date();
    const node = JSON.parse(phase.node) as AppNode;
    setupEnvironmentForPhase(phase, environment);

    await prisma.executionPhase.update({
        where: {id: phase.id},
        data: {
            status: ExecutionPhaseStatus.RUNNING,
            startedAt,
        },
    });

    const creditsRequired = TaskRegistry[node.data.type].credits;
    console.log(`Execution phase ${phase.name} with ${creditsRequired} credits required`);

    //TODO: dec user Balance (with req credits)

    const success =  await executePhase(phase, node, environment)

    await finalizePhase(phase.id, success);
    return success;
}

async function finalizePhase(phaseId: string, success: boolean) {
    const finalStatus = success
        ? ExecutionPhaseStatus.COMPLETED
        : ExecutionPhaseStatus.FAILED;

        await prisma.executionPhase.update({
            where: {id: phaseId},
            data: {
                status: finalStatus,
                completedAt: new Date(),
            }
        })
} 

async function executePhase(phase: ExecutionPhase, node: AppNode, environment: Environment): Promise<boolean> {
    const runFn = ExecutorRegistry[node.data.type as keyof typeof ExecutorRegistry];
    if(!runFn) {
        return false;
    }

    const executionEnvironment: ExecutionEnvironment = createExecutionEnvironment(node, environment); 
    return await runFn(executionEnvironment);
}

function setupEnvironmentForPhase(node: AppNode, environment: Environment) {
    environment.phases[node.id] = {inputs: {}, outputs: {}};
    const inputs = TaskRegistry[node.data.type].inputs;
    for(const input of inputs) {
        const inputValue = node.data.inputs[input.name];
        if(inputValue) {
            environment.phases[node.id].inputs[input.name] = inputValue;
            continue;
        }
    }
}

function createExecutionEnvironment(node: AppNode, environment: Environment) {
    return {
        getInput: (name: string) => environment.phases[node.id].inputs[name],
    }
}