import { AwaInterpreter } from "../core/awaxecute.js";
import type { NestedNumberArray } from "../core/awatypes.js";

export interface MessageShareControlsSignal
{
    msgType: "SHARE_CONTROL";
    sharedBuffer: SharedArrayBuffer;
}

export interface MessageYieldSignal
{
    msgType: "YIELD";
}

export interface MessageRefreshStatsSignal
{
    msgType: "STATS_RESPONSE";
    awaindex?: number;
    executionTime?: number;
    awatokens?: readonly number[];
    bubbles?: NestedNumberArray;
    hasFinished?: boolean;
}
export interface MessageStepSignal
{
    msgType: "STEP";
}

export interface MessageAwatalkUpdate
{
    msgType: "SET_AWATALK";
    awatalk: string;
}

export interface MessageInputRequest
{
    msgType: "INPUT_REQUEST";
    inputType: "STRING" | "NUMBER";
}
export interface MessageInputResponse
{
    msgType: "INPUT_RESPONSE";
    inStr: string;
}

export interface MessageOutputRequest
{
    msgType: "RUN";
}
export interface MessageOutputResponse
{
    msgType: "OUTPUT";
    outStr: string;
}

export interface MessageHaltRequest
{
    msgType: "HALT_RUN_REQUEST";
}
export interface MessageHaltResponse
{
    msgType: "HALT_RUN_RESPONSE";
    haltRun: boolean;
}

export interface ChangedProperties
{
    awaindex: boolean;
    executionTime: boolean;
    awatokens: boolean;
    bubbles: boolean;
    hasFinished: boolean;
}
export type StatsWatchCallback = (changed: ChangedProperties) => void

type recievedMessagesTypes =
    | MessageInputResponse
    | MessageAwatalkUpdate
    | MessageOutputRequest
    | MessageStepSignal
    | MessageHaltResponse
    | MessageShareControlsSignal;

function
startWorker(): void
{
    const awaInterpreter = new AwaInterpreter;
    let sendInputCallback: ((inStr: string) => void) | null = null;
    let stopExecutionCallback: ((stop: boolean) => void) | null = null;

    // currently only handles stop signal at idx #0
    let controls: Uint8Array<SharedArrayBuffer> | null = null;

    function
    sendResetStats(): void
    {
        postMessage({
            msgType: "STATS_RESPONSE",
            awaindex: 0,
            executionTime: 0,
            awatokens: awaInterpreter.awatokens,
            bubbles: [],
            hasFinished: awaInterpreter.hasFinished,
        } satisfies MessageRefreshStatsSignal)
    }

    function
    sendExecutionStats(): void
    {
        postMessage({
            msgType: "STATS_RESPONSE",
            awaindex: awaInterpreter.awaindex,
            executionTime: awaInterpreter.executionTime,
            bubbles: awaInterpreter.getBubblesList(),
            hasFinished: awaInterpreter.hasFinished,
        } satisfies MessageRefreshStatsSignal);
    }

    function
    checkForHalt(): Promise<boolean>
    {
        return new Promise(res =>
        {
            if(controls)
            {
                const haltFlag = Boolean(Atomics.load(controls!, 0));
                if(haltFlag) Atomics.store(controls!, 0, 0); // reset flag after use
                res(haltFlag);
            }
            else
            {
                postMessage({ msgType: "HALT_RUN_REQUEST" } satisfies MessageHaltRequest);
                stopExecutionCallback = res;
            }
        });
    }

    function
    yieldWorker(): Promise<void>
    {
        // the only reason this is required is because the shared mem doesn't seem
        // to be updated immediately? at least, reading after without this "yield"
        // shows that control[0] hasn't changed, which is confusing
        return new Promise<void>(res =>
        {
            addEventListener("message", function
                finishYielding(ev: MessageEvent<MessageYieldSignal>): void
                {
                    if(ev.data.msgType !== "YIELD") return;
                    removeEventListener("message", finishYielding);
                    res();
                }
            );
            postMessage({ msgType: "YIELD" } satisfies MessageYieldSignal);
        })
    }

    addEventListener("message", async (ev: MessageEvent<recievedMessagesTypes>) =>
    {
        const data = ev.data;
        switch (data.msgType) {
            case "SHARE_CONTROL":
                controls = new Uint8Array(data.sharedBuffer);
                console.log("Worker: Received controls")
                break;

            case "INPUT_RESPONSE":
                sendInputCallback?.(data.inStr);
                sendInputCallback = null;
                break;

            case "SET_AWATALK":
                awaInterpreter.UseAwatalk(data.awatalk)
                sendResetStats();
                break;

            case "RUN":
                awaInterpreter.run(sendExecutionStats, checkForHalt, yieldWorker);
                break;
            
            case "HALT_RUN_RESPONSE":
                stopExecutionCallback?.(data.haltRun);
                stopExecutionCallback = null;
                break;

            case "STEP":
                awaInterpreter.step()
                    .then(() => sendExecutionStats());
                break;
        }
    })

    awaInterpreter.UseInputCallback((inputType) =>
    {
        return new Promise<string>(res =>
        {
            sendInputCallback = res;
            postMessage({ msgType: "INPUT_REQUEST", inputType } satisfies MessageInputRequest);
        })
    });

    awaInterpreter.UseOutputCallback((outStr) =>
    {
        postMessage({ msgType: "OUTPUT", outStr } satisfies MessageOutputResponse);
    });
}

startWorker();