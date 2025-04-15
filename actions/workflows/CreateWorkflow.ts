'use server';

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Edge } from '@xyflow/react';

import { prisma } from '@/lib/prisma';
import { CreateFlowNode } from '@/lib/workflow/createFlowNode';
import { createWorkflowSchema, type createWorkflowSchemaType } from '@/schema/workflow';
import { WorkflowStatus } from '@/types/workflow';
import { AppNode } from '@/types/appNode';
import { TaskType } from '@/types/task';

export async function createWorkflow(form: createWorkflowSchemaType) {
  const { success, data } = createWorkflowSchema.safeParse(form);

  if (!success) {
    throw new Error('Invalid form data');
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthenticated');
  }

  const initialFlow: { nodes: AppNode[]; edges: Edge[] } = {
    nodes: [],
    edges: [],
  };

  // Add initial browser launch node
  initialFlow.nodes.push(CreateFlowNode(TaskType.LAUNCH_BROWSER));

  // Extract expected fields from validated schema result
  const { name, description } = data;

  const result = await prisma.workflow.create({
    data: {
      userId,
      status: WorkflowStatus.DRAFT,
      definition: JSON.stringify(initialFlow),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });

  if (!result) {
    throw new Error('Failed to create workflow');
  }

  redirect(`/workflow/editor/${result.id}`);
}
