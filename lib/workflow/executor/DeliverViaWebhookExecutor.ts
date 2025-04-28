import { env } from 'process';
import { DeliverViaWebhookTask } from './../task/DeliverViaWebhook';
import { ExecutionEnvironment } from '@/types/executor';

export async function DeliverViaWebhookExecutor(
  environment: ExecutionEnvironment<typeof DeliverViaWebhookTask>
): Promise<boolean> {
  try {
    const targeturl = environment.getInput('Target URL');
    if (!targeturl) {
      environment.log.error('input->selector not defined');
    }

    const body = environment.getInput("Body")
    if(!body) {
        environment.log.error('input->body not defined')
    }
    const response = await fetch(targeturl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const statusCode = response.status;
    if (statusCode !== 200) {
      environment.log.error(`status code: ${statusCode}`);
      return false;
    }
    const responseBody = await response.json();
    environment.log.info(responseBody);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}