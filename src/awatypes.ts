export interface AwaStatsRefresh
{
    msgType: "STATS_RESPONSE";
    awaindex?: number;
    executionTime?: number;
    awatokens?: readonly number[];
    bubbles?: NestedNumberArray;
    hasFinished?: boolean;
}

export interface AwaInputRequest
{
    msgType: "INPUT_REQUEST";
    inputType: "STRING" | "NUMBER";
}
export interface AwaInputResponse
{
    msgType: "INPUT_RESPONSE";
    inStr: string;
}

export interface AwaOutputResponse
{
    msgType: "OUTPUT";
    outStr: string;
}

export interface AwaRunRequest
{
    msgType: "RUN";
}
export interface AwaRunHaltingRequest
{
    msgType: "HALT_RUN_REQUEST";
}
export interface AwaRunHaltingResponse
{
    msgType: "HALT_RUN_RESPONSE";
    haltRun: boolean;
}
export interface AwaStepRequest
{
    msgType: "STEP";
}

export interface AwatalkSetRequest
{
    msgType: "SET_AWATALK";
    awatalk: string;
}

export interface StatsWatchChanges
{
    awaindex: boolean;
    executionTime: boolean;
    awatokens: boolean;
    bubbles: boolean;
    hasFinished: boolean;
}
export type StatsWatchCallback = (changed: StatsWatchChanges) => void

export type Bubble = SimpleBubble | doubleBubble;
export interface SimpleBubble
{
    type: "SIMPLE";
    value: number;
    next: Bubble | null;
    prev: Bubble | null;
}
export interface doubleBubble
{
    type: "DOUBLE";
    contents: Bubble | null;
    next: Bubble | null;
    prev: Bubble | null;
}

export type NestedNumberArray = (NestedNumberArray | number)[];