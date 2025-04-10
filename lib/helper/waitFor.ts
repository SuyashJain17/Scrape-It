import { resolve } from "path";

export function waitFor(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}