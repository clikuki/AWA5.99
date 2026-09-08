import type { InputCallback, OutputCallback } from "./awaxecute.js";
import type { AwaInputRequest,
              AwaInputResponse,
              AwaOutputResponse,
              AwaRunRequest,
              AwaStatsRefresh,
              AwaStepRequest,
              AwatalkSetRequest,
              NestedNumberArray } from "./awatypes.js";

type awaOutbounds = AwaStatsRefresh | AwaInputRequest | AwaOutputResponse;

export class Awarunner
{
    #worker: Worker;
    #awaindex = 0;
    #executionTime = 0;
    #awatokens: readonly number[] = [];
    #bubbles: NestedNumberArray = [];
    #hasFinished = true;
    
    #getInput: InputCallback | null = null;
    #sendOutput: OutputCallback | null = null;

    #signalRefresedStats: (() => void) | null = null;

    constructor()
    {
        this.#worker = new Worker("build/awaworker.js", { type: "module" });

        this.#worker.addEventListener("message", (ev: MessageEvent<awaOutbounds>) =>
        {
            const data = ev.data;
            switch (data.msgType) {
                case "STATS_RESPONSE": {
                    this.#awaindex = data.awaindex;
                    this.#executionTime = data.executionTime;
                    this.#awatokens = data.awatokens;
                    this.#bubbles = data.bubbles;
                    this.#hasFinished = data.hasFinished;
                    
                    this.#signalRefresedStats?.();
                    this.#signalRefresedStats = null;
                    }break;
                case "INPUT_REQUEST":
                    if(!this.#getInput) break;
                    this.#getInput(data.inputType)
                        .then(inStr => this.#worker.postMessage(
                            {msgType: "INPUT_RESPONSE", inStr } satisfies AwaInputResponse
                        ))
                    break;
                case "OUTPUT":
                    this.#sendOutput?.(data.outStr);
                    break;
            }
        })
    }

    get awaindex(): number
    {
        return this.#awaindex;
    }

    get executionTime(): number
    {
        return this.#executionTime;
    }
    
    get awatokens(): readonly number[] {
        return this.#awatokens;
    }
    
    get bubbles(): NestedNumberArray
    {
        return this.#bubbles;
    }
    
    get hasFinished(): boolean {
        return this.#hasFinished;
    };

    public UseInputCallback(cb: InputCallback): void
    {
        this.#getInput = cb;
    }

    public UseOutputCallback(cb: OutputCallback): void
    {
        this.#sendOutput = cb;
    }

    public UseAwatalk(awatalk: string): void
    {
        this.#worker.postMessage({ msgType: "SET_AWATALK", awatalk } satisfies AwatalkSetRequest);
    }

    public run(): Promise<void>
    {
        this.#worker.postMessage({ msgType: "RUN" } satisfies AwaRunRequest);
        return new Promise(res => this.#signalRefresedStats = res);
    }

    public step(): Promise<void>
    {
        this.#worker.postMessage({ msgType: "STEP" } satisfies AwaStepRequest);
        return new Promise(res => this.#signalRefresedStats = res);
    }
}
