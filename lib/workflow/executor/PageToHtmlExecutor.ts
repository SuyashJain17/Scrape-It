import { ExecutionEnvironment } from '@/types/executor';
import { PageToHtmlTask } from '../task/PageToHtml';
import { ExtractTextFromElementTask } from '../task/ExtractTextFromElement';

export async function PageToHtmlExecutor(environment: ExecutionEnvironment<typeof PageToHtmlTask>): Promise<boolean> {
    try {
        const html = await environment.getPage()!.content();
        environment.setOutput(ExtractTextFromElementTask.inputs[0], html);
        console.log(html)
        return true;
    } catch (error: any) {
        environment.log.error(error.message);
        return false;
    }
}