
import { auth } from '@clerk/nextjs/server';

import Editor from '@/app/workflow/_components/Editor';

import {prisma} from '@/lib/prisma';

export default async function EditorPage({ params }: { params: { workflowId: string } }) {
  const { workflowId } = params;

  const { userId } = await auth();

  if (!userId) {
    return <div>Unauthenticated</div>;
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
      userId,
    },
  });

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return (
  <div className="flex h-full w-full flex-col overflow-hidden">
  <Editor workflow={workflow} />
  </div>)
}