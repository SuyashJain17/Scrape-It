"use server"

import { WorkflowStatus } from '@/types/workflow';
import { createWorkflowSchema, createWorkflowSchemaType } from '@/schema/workflow';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function createWorkflow(form: createWorkflowSchemaType) {
    const {success, data} = createWorkflowSchema.safeParse(form);

    if(!success) {
        throw new Error("invalid form data");
    }
    const {userId} = auth();

    if(!userId) {
    throw new Error("unauthenticated")
    }

    const result = await prisma.workflow.create({
        data: {
            userId,
            status: WorkflowStatus.DRAFT,
            definition: "TODO",
            ...data,
        },
    });

    if(!result) {
        throw new Error("failed to create workflow");
    }
    redirect(`/workflow/editor/${result.id}`)
}
