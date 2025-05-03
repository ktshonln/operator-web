// This is for the browser: to be used by when the app is running in the browser
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
