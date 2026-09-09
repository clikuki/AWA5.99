import { AwaInterpreter } from "./awaxecute.js";
import type { AwaControlsSharing, AwaInputRequest,
              AwaInputResponse,
              AwaOutputResponse,
              AwaRunHaltingRequest,
              AwaRunHaltingResponse,
              AwaRunRequest,
              AwaStatsRefresh,
              AwaStepRequest,
              AwatalkSetRequest, 
              AwaYieldMoment} from "./awatypes.js"; 

type awaInbounds =
    | AwaInputResponse
    | AwatalkSetRequest
    | AwaRunRequest
    | AwaStepRequest
    | AwaRunHaltingResponse
    | AwaControlsSharing;

function startWorker(): void
{
    const awaInterpreter = new AwaInterpreter;
    let sendInputCallback: ((inStr: string) => void) | null = null;
    let stopExecutionCallback: ((stop: boolean) => void) | null = null;

    // currently only handles stop signal at idx #0
    let controls: Uint8Array<SharedArrayBuffer> | null = null;

    function sendResetStats(): void
    {
        postMessage({
            msgType: "STATS_RESPONSE",
            awaindex: 0,
            executionTime: 0,
            awatokens: awaInterpreter.awatokens,
            bubbles: [],
            hasFinished: awaInterpreter.hasFinished,
        } satisfies AwaStatsRefresh)
    }

    function sendExecutionStats(): void
    {
        postMessage({
            msgType: "STATS_RESPONSE",
            awaindex: awaInterpreter.awaindex,
            executionTime: awaInterpreter.executionTime,
            bubbles: awaInterpreter.getBubblesList(),
            hasFinished: awaInterpreter.hasFinished,
        } satisfies AwaStatsRefresh);
    }

    function checkForHalt(): Promise<boolean>
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
                postMessage({ msgType: "HALT_RUN_REQUEST" } satisfies AwaRunHaltingRequest);
                stopExecutionCallback = res;
            }
        });
    }

    function yieldWorker(): Promise<void>
    {
        return new Promise<void>(res =>
        {
            addEventListener("message", function
                finishYielding(ev: MessageEvent<AwaYieldMoment>): void
                {
                    if(ev.data.msgType !== "YIELD") return;
                    removeEventListener("message", finishYielding);
                    res();
                }
            );
            postMessage({ msgType: "YIELD" } satisfies AwaYieldMoment);
        })
    }

    addEventListener("message", async (ev: MessageEvent<awaInbounds>) =>
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
            postMessage({ msgType: "INPUT_REQUEST", inputType } satisfies AwaInputRequest);
        })
    });

    awaInterpreter.UseOutputCallback((outStr) =>
    {
        postMessage({ msgType: "OUTPUT", outStr } satisfies AwaOutputResponse);
    });
}

startWorker();