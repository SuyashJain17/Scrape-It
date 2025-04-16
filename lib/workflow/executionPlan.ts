import { AppNode, AppNodeMissingInputs } from "@/types/appNode";
import { Edge } from "@xyflow/react";
import { TaskRegistry } from "./task/registry";
import { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from "@/types/workflow";

export enum FlowToExecutionPlanValidationError {
  "NO_ENTRY_POINT",
  "INVALID_INPUTS",
}

type FlowToExecutionType = {
    executionPlan: WorkflowExecutionPlan;
    error?: {
      type: FlowToExecutionPlanValidationError;
      invlaidElements: AppNodeMissingInputs[];
    }
};

export default function FlowToExecutionPlan(nodes: AppNode[], edges: Edge[]): FlowToExecutionType {
    const entryPoint = nodes.find(
        (node) => TaskRegistry[node.data.type].isEntryPoint
    );
    if(!entryPoint) {
        return {
          executionPlan: [],
          error: {
            type: FlowToExecutionPlanValidationError.NO_ENTRY_POINT,
            invlaidElements: [],
          }
        }
    }

    const inputsWithError: AppNodeMissingInputs[] = [];
    const planned = new Set<string>();

    const invalidInputs = getInvalidInputs(entryPoint, edges, planned);
    
    if(invalidInputs.length > 0) {
      inputsWithError.push({
        nodeId: entryPoint.id,
        inputs: invalidInputs,
      });
    }

    const executionPlan: WorkflowExecutionPlan = [
        {
            phase: 1,
            nodes: [entryPoint]
        }
      ];
      planned.add(entryPoint.id);
    
    for(let phase = 2 ; nodes.length && planned.size  < nodes.length; phase++) {
        const nextPhase: WorkflowExecutionPlanPhase = {phase, nodes: []};
        for(const currentNode of nodes) {
            if(planned.has(currentNode.id)) {
                continue;
            }

            const invalidInputs = getInvalidInputs(currentNode, edges, planned);
            if(invalidInputs.length > 0) {
                const incomers = getIncomers(currentNode, nodes, edges);
                if(incomers.every((incomer) => planned.has(incomer.id))) {
                    console.error("invlaid inputs", currentNode.id, invalidInputs);
                    inputsWithError.push({
                      nodeId: currentNode.id,
                      inputs: invalidInputs,
                    });
                } else {
                    continue
                }
            }

            nextPhase.nodes.push(currentNode);
        }
        for(const node of nextPhase.nodes) {
          planned.add(node.id)
        }
        executionPlan.push(nextPhase)
    }
    if(inputsWithError.length > 0) {
      return {
        executionPlan: [],
        error: {
          type: FlowToExecutionPlanValidationError.INVALID_INPUTS,
          invlaidElements: inputsWithError,
        }
      }
    }
    return {executionPlan};
}

function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
    const invalidInputs = [];
    const inputs = TaskRegistry[node.data.type].inputs;
  
    for (const input of inputs) {
      const inputValue = node.data.inputs[input.name];
      const inputValueProvided = inputValue?.length > 0;
      if (inputValueProvided) {
        // this input is fine, so we can move on
        continue;
      }
  
      // If a value is not provided by the user then we need to check
      // if there is an output linked to the current input
      const incomingEdges = edges.filter((edge) => edge.target === node.id);
  
      const inputLinkedToOutput = incomingEdges.find((edge) => edge.targetHandle === input.name);
  
      const requiredInputProvidedByVisitedOutput =
        input.required && inputLinkedToOutput && planned.has(inputLinkedToOutput.source);
  
      if (requiredInputProvidedByVisitedOutput) {
        // the input is required and we have a valid value for it
        // provided by a task that is already planned
        continue;
      } else if (!input.required) {
        // If the input is not required but there is an output linked to it
        // then we need to be sure that the output is already planned
        if (!inputLinkedToOutput) continue;
        if (inputLinkedToOutput && planned.has(inputLinkedToOutput.source)) {
          // The output is providing a value to the input: the input is fine
          continue;
        }
      }
  
      invalidInputs.push(input.name);
    }
  
    return invalidInputs;
  }

  function getIncomers(node: AppNode, nodes: AppNode[], edges: Edge[]) {
    if(!node.id) {
      return [];
    }
    const incomersIds = new Set();
    edges.forEach((edges) => {
      if(edges.target === node.id) {
        incomersIds.add(edges.source)
      }
    });
    return nodes.filter((n) => incomersIds.has(n.id))
  }