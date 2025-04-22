import { LogCollector } from './../../types/log';
import "server-only"
import { prisma } from "../prisma"
import { revalidatePath } from "next/cache";
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from "@/types/workflow";
import { ExecutionPhase } from "@prisma/client";
import { AppNode } from "@/types/appNode";
import { TaskRegistry } from "./task/registry";
import { ExecutorRegistry } from "./executor/registry";
import { Environment, ExecutionEnvironment } from "@/types/executor";
import { TaskParamType } from "@/types/task";
import { Browser, Page } from "puppeteer";
import { Edge } from "@xyflow/react";
import { createLogCollector } from '../log';



export async function ExecuteWorkflow(executionId: string) {
    const execution = await prisma.workflowExecution.findUnique({
        where: {id: executionId},
        include: {workflow: true, phases: true},
    });
    if(!execution) {
        throw new Error("execution not found")
    }
    const edges = JSON.parse(execution.workflow.definition).edges as Edge[];

    const environment: Environment = {phases: {}}

    await initialWorkflowExecution(executionId, execution.workflowId);
    await initialPhaseStatuses(execution);
    const logCollector = createLogCollector()

    let creditsConsumed = 0;
    let executionFailed = false;
    for(const phase of execution.phases) {
        //TODO: consume credits
        const edges = JSON.parse(execution.workflow.definition) as Edge[];
        const phaseExecution = await executeWorkflowPhase(phase, environment, edges);
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
    await cleanupEnvironment(environment);
    console.log("Workflow fully executed. Final status updated.");
    revalidatePath(`/workflow/runs/${execution.workflowId}`);
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
                in: execution.phases.map((phase: any) => phase.id),
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

async function executeWorkflowPhase(phase: ExecutionPhase, environment: Environment, edges: Edge[]) {
    const logCollector = createLogCollector();
    const startedAt = new Date();
    const node = JSON.parse(phase.node) as AppNode;
    const appNode = JSON.parse(phase.node) as AppNode;
    setupEnvironmentForPhase(appNode, environment, edges);

    await prisma.executionPhase.update({
        where: {id: phase.id},
        data: {
            status: ExecutionPhaseStatus.RUNNING,
            startedAt,
            inputs: JSON.stringify(environment.phases[node.id].inputs),
        },
    });

    const creditsRequired = TaskRegistry[node.data.type].credits;
    console.log(`Execution phase ${phase.name} with ${creditsRequired} credits required`);

    //TODO: dec user Balance (with req credits)

    const success =  await executePhase(phase, node, environment, logCollector)

    const outputs = environment.phases[node.id].outputs;
    await finalizePhase(phase.id, success, outputs, logCollector);
    return success;
}

async function finalizePhase(phaseId: string, success: boolean, outputs: any, logCollector: LogCollector) { 
    const finalStatus = success
        ? ExecutionPhaseStatus.COMPLETED
        : ExecutionPhaseStatus.FAILED;

        await prisma.executionPhase.update({
            where: {id: phaseId},
            data: {

                status: finalStatus,
                completedAt: new Date(),
                outputs: JSON.stringify(outputs),
                logs: {
                    createMany: {
                        data: logCollector.getAll().map(log => ({
                            message: log.message,
                            logLevel: log.level,
                            timestamp: log.timestamp,
                        }))
                    }
                }
            }
        })
} 

async function executePhase(phase: ExecutionPhase, node: AppNode, environment: Environment,logCollector: LogCollector): Promise<boolean> {
    const runFn = ExecutorRegistry[node.data.type as keyof typeof ExecutorRegistry];
    if(!runFn) {
        return false;
    }

    const executionEnvironment: ExecutionEnvironment<any> = createExecutionEnvironment(node, environment, logCollector); 
    return await runFn(executionEnvironment);
}

function setupEnvironmentForPhase(node: AppNode, environment: Environment, edges: Edge[]) {
    environment.phases[node.id] = {inputs: {}, outputs: {}};
    const inputs = TaskRegistry[node.data.type].inputs;
    for(const input of inputs) {
        const inputValue = node.data.inputs[input.name];
        if(inputValue) {
            if(input.type === TaskParamType.BROWSER_INSTANCE) continue;
            environment.phases[node.id].inputs[input.name] = inputValue;
            continue;
        }
        const connectEdge = edges.find((edge) => edge.target === node.id && edge.targetHandle === input.name);

        if(!connectEdge) {
            console.error("Missing edge for input", input.name, "node id:", node.id);
            continue;
        }
        if (connectEdge.source && connectEdge.sourceHandle) {
            const outputValue = environment.phases[connectEdge.source]?.outputs[connectEdge.sourceHandle];
            environment.phases[node.id].inputs[input.name] = outputValue;
        } else {
            console.error("Invalid edge source or sourceHandle for input", input.name, "node id:", node.id);
        }
    }
}

function createExecutionEnvironment(node: AppNode, environment: Environment, logCollector: LogCollector): ExecutionEnvironment<any> {
    return {
        getInput: (name: string) => environment.phases[node.id].inputs[name],
        setOutput: (name: string, value: string) => {
            environment.phases[node.id].outputs[name] = value;
        },
        getBrowser: () => environment.browser,
        setBrowser: (browser: Browser) => (environment.browser = browser),

        getPage: () => environment.page,
        setPage: (page: Page) => (environment.page = page),

        log: logCollector,
    }
}

async function cleanupEnvironment(environment: Environment) {
    if(environment.browser) {
        await environment.browser.close().catch((err) => console.error(err));
    }
}