export type Bubble = SimpleBubble | DoubleBubble;
export interface SimpleBubble
{
    type: "SIMPLE";
    value: number;
    next: Bubble | null;
    prev: Bubble | null;
}
export interface DoubleBubble
{
    type: "DOUBLE";
    contents: Bubble | null;
    next: Bubble | null;
    prev: Bubble | null;
}

export type NestedNumberArray = (NestedNumberArray | number)[];

export type InterpreterInputCallback = (type: "STRING" | "NUMBER") => Promise<string>;
export type InterpreterOutputCallback = (awaOutput: string) => void;

export interface CharacterMapping
{
    codeToChar: Record<number, string>,
    charToCode: Record<string, number>,
}