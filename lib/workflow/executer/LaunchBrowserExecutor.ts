import { LaunchBrowserTask } from './../task/LaunchBrowser';
import { environment } from './../../../node_modules/puppeteer-core/src/environment';
import { waitFor } from '@/lib/helper/waitFor';
import { Environment, ExecutionEnvironment } from '@/types/executor';
import  puppeteer  from 'puppeteer';

export async function LaunchBrowserExecutor(environment: ExecutionEnvironment<typeof LaunchBrowserTask>): Promise<boolean> {
    try {
        const websiteUrl = environment.getInput("Website Url2");
        const browser = await puppeteer.launch({
            headless: false,
        })
        await waitFor(3000);
        browser.close();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}