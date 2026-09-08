import { AwaInterpreter } from "./awaxecute.js";
import type { AwaInputRequest,
              AwaInputResponse,
              AwaOutputResponse,
              AwaRunRequest,
              AwaStatsRefresh,
              AwaStepRequest,
              AwatalkSetRequest } from "./awatypes.js"; 

type awaInbounds = AwaInputResponse | AwatalkSetRequest | AwaRunRequest | AwaStepRequest;

function startWorker(): void
{
    const awaInterpreter = new AwaInterpreter;
    let sendInputCallback: ((inStr: string) => void) | null = null;

    function sendStats(): void
    {
        const awatokens = awaInterpreter.awatokens;
        const bubbles = awaInterpreter.getBubblesList();
        postMessage({
            msgType: "STATS_RESPONSE",
            awaindex: awaInterpreter.awaindex,
            executionTime: awaInterpreter.executionTime,
            awatokens: awatokens,
            bubbles: bubbles,
            hasFinished: awaInterpreter.hasFinished,
        } satisfies AwaStatsRefresh);
    }

    addEventListener("message", (ev: MessageEvent<awaInbounds>) =>
    {
        const data = ev.data;
        switch (data.msgType) {
            case "INPUT_RESPONSE":
                sendInputCallback?.(data.inStr);
                sendInputCallback = null;
                break;

            case "SET_AWATALK":
                awaInterpreter.UseAwatalk(data.awatalk);
                break;

            case "RUN":
                awaInterpreter.run()
                    .then(() => sendStats());
                break;

            case "STEP":
                awaInterpreter.step()
                    .then(() => sendStats());
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