import type { InputCallback, OutputCallback } from "./awaxecute.js";
import type { AwaInputRequest,
              AwaInputResponse,
              AwaOutputResponse,
              AwaRunRequest,
              AwaStatsRefresh,
              AwaStepRequest,
              AwatalkSetRequest,
              StatsWatchChanges,
              NestedNumberArray, 
              StatsWatchCallback, 
              AwaRunHaltingRequest, 
              AwaRunHaltingResponse} from "./awatypes.js";

type awaOutbounds = AwaStatsRefresh | AwaInputRequest | AwaOutputResponse | AwaRunHaltingRequest;

type WaitHaltCallback = () => void;

export class Awarunner
{
    #worker: Worker;
    #awaindex = 0;
    #executionTime = 0;
    #awatokens: readonly number[] = [];
    #bubbles: NestedNumberArray = [];
    #hasFinished = true;

    #isRunning = false;
    #haltRunAtNextOpportunity = false;
    
    #getInput: InputCallback | null = null;
    #sendOutput: OutputCallback | null = null;
    #watchStats: StatsWatchCallback | null = null;
    #waitHalt: WaitHaltCallback | null = null;

    constructor()
    {
        this.#worker = new Worker("build/awaworker.js", { type: "module" });

        this.#worker.addEventListener("message", (ev: MessageEvent<awaOutbounds>) =>
        {
            const data = ev.data;
            switch (data.msgType) {
                case "STATS_RESPONSE": {
                    const changed: StatsWatchChanges = {
                        awaindex: data.awaindex !== undefined,
                        executionTime: data.executionTime !== undefined,
                        awatokens: data.awatokens !== undefined,
                        bubbles: data.bubbles !== undefined,
                        hasFinished: data.hasFinished !== undefined,
                    }

                    if(changed.awaindex) this.#awaindex = data.awaindex!;
                    if(changed.executionTime) this.#executionTime = data.executionTime!;
                    if(changed.awatokens) this.#awatokens = data.awatokens!;
                    if(changed.bubbles) this.#bubbles = data.bubbles!;
                    if(changed.hasFinished) this.#hasFinished = data.hasFinished!;

                    this.#watchStats?.(changed);
                    }break;

                case "INPUT_REQUEST":
                    if(!this.#getInput) break;
                    this.#getInput(data.inputType)
                        .then(inStr => this.#worker.postMessage(
                            {msgType: "INPUT_RESPONSE", inStr } satisfies AwaInputResponse
                        ))
                    break;

                case "HALT_RUN_REQUEST":
                    this.#worker.postMessage({
                        msgType: "HALT_RUN_RESPONSE",
                        haltRun: this.#haltRunAtNextOpportunity
                    } satisfies AwaRunHaltingResponse);
                    if(this.#haltRunAtNextOpportunity)
                    {
                        this.#isRunning = false;
                        this.#haltRunAtNextOpportunity = false;

                        this.#waitHalt?.();
                        this.#waitHalt = null;
                    }
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
    }

    public watchStatsChange(cb: StatsWatchCallback): void
    {
        this.#watchStats = cb;
    }

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
        if(this.#isRunning) return;
        this.#worker.postMessage({ msgType: "SET_AWATALK", awatalk } satisfies AwatalkSetRequest);
    }

    public run(): void
    {
        if(this.#isRunning) return;
        this.#isRunning = true;
        this.#worker.postMessage({ msgType: "RUN" } satisfies AwaRunRequest);
    }

    public step(): void
    {
        if(this.#isRunning) return;
        this.#worker.postMessage({ msgType: "STEP" } satisfies AwaStepRequest);
    }

    public stop(): Promise<void>
    {
        if(!this.#isRunning) return Promise.resolve();
        this.#haltRunAtNextOpportunity = true;
        return new Promise(res => this.#waitHalt = res);
    }
}
