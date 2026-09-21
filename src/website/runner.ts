import type { InterpreterInputCallback,
              InterpreterOutputCallback,
              NestedNumberArray } from "../core/awatypes.js";
import type { MessageInputRequest,
              MessageInputResponse,
              MessageOutputResponse,
              MessageOutputRequest,
              MessageRefreshStatsSignal,
              MessageStepSignal,
              MessageAwatalkUpdate,
              ChangedProperties,
              StatsWatchCallback, 
              MessageHaltRequest, 
              MessageHaltResponse,
              MessageShareControlsSignal,
              MessageYieldSignal} from "./engineWorker.js";

type recievedMessagesTypes =
    | MessageRefreshStatsSignal
    | MessageInputRequest
    | MessageOutputResponse
    | MessageHaltRequest
    | MessageYieldSignal;

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

    #controls: Uint8Array<SharedArrayBuffer> | null = null;
    
    #getInput: InterpreterInputCallback | null = null;
    #sendOutput: InterpreterOutputCallback | null = null;
    #watchStats: StatsWatchCallback | null = null;
    #waitHalt: WaitHaltCallback | null = null;

    constructor()
    {
        this.#worker = new Worker("build/website/engineWorker.js", { type: "module" });

        if(crossOriginIsolated)
        {
            const sharedBuffer = new SharedArrayBuffer(4);
            this.#controls = new Uint8Array(sharedBuffer);
            this.#worker.postMessage({
                msgType: "SHARE_CONTROL",
                sharedBuffer
            } satisfies MessageShareControlsSignal);
            console.log("Main: Sent controls to worker")
        }

        this.#worker.addEventListener("message", (ev: MessageEvent<recievedMessagesTypes>) =>
        {
            const data = ev.data;
            switch (data.msgType) {
                case "STATS_RESPONSE": {
                    const changed: ChangedProperties = {
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

                    if(this.#hasFinished) this.#isRunning = false;

                    this.#watchStats?.(changed);
                    }break;

                case "INPUT_REQUEST":
                    if(!this.#getInput) break;
                    this.#getInput(data.inputType)
                        .then(inStr => this.#worker.postMessage(
                            {msgType: "INPUT_RESPONSE", inStr } satisfies MessageInputResponse
                        ))
                    break;

                case "HALT_RUN_REQUEST":
                    this.#worker.postMessage({
                        msgType: "HALT_RUN_RESPONSE",
                        haltRun: this.#haltRunAtNextOpportunity
                    } satisfies MessageHaltResponse);
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
                
                case "YIELD":
                    this.#worker.postMessage({ msgType: "YIELD" } satisfies MessageYieldSignal);
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

    public UseInputCallback(cb: InterpreterInputCallback): void
    {
        this.#getInput = cb;
    }

    public UseOutputCallback(cb: InterpreterOutputCallback): void
    {
        this.#sendOutput = cb;
    }

    public UseAwatalk(awatalk: string): void
    {
        if(this.#isRunning) return;
        this.#worker.postMessage({ msgType: "SET_AWATALK", awatalk } satisfies MessageAwatalkUpdate);
    }

    public run(): void
    {
        if(this.#isRunning) return;
        this.#isRunning = true;
        this.#worker.postMessage({ msgType: "RUN" } satisfies MessageOutputRequest);
    }

    public step(): void
    {
        if(this.#isRunning) return;
        this.#worker.postMessage({ msgType: "STEP" } satisfies MessageStepSignal);
    }

    public stop(): Promise<void>
    {
        if(!this.#isRunning) return Promise.resolve();
        if(this.#controls)
        {
            Atomics.store(this.#controls, 0, 1);
            this.#isRunning = false;
            return Promise.resolve();
        }

        this.#haltRunAtNextOpportunity = true;
        return new Promise(res => this.#waitHalt = res);
    }
}
