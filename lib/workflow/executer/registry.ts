import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor";

export const ExecutorRegistry = {
    Launch_Browser: LaunchBrowserExecutor,
    PAGE_TO_HTML: () => Promise.resolve(true),
    EXTRACT_TEXT_FROM_ELEMENT: () => Promise.resolve(true),
}