import { AwaSCII, AWATISMS, FullerAwaSCII, paramedAwatisms } from "./awaconsts.js";
import { parseAwas } from "./awaparser.js";
import { tokenizeAwas } from "./awatokener.js";
import { Bubble, CharacterMapping, doubleBubble, NestedNumberArray, SimpleBubble } from "./awatypes.js";

function
convertStringToCharCodes(str: string, charMap: CharacterMapping): number[]
{
    const codes: number[] = [];

    for(const char of str)
    {
        const code = charMap.charToCode[char];
        if(code === undefined) continue;
        codes.push(code);
    }

    return codes;
}

function
convertCharCodesToString(codes: number[], charMap: CharacterMapping): string
{
    let output = "",
        i = 0,
        code: number,
        char: string | undefined;

    for(; i < codes.length; i++)
    {
        code = codes[i];
        char = charMap.codeToChar[code];
        if(char) output += char;
    }

    return output;
}

function
readNumberFromString(str: string): number
{
    let isNegative = false,
        numStr = "";

    for(const char of str)
    {
        if(!isNegative && char === "-")
        {
            isNegative = true;
            continue;
        }
        else if(/\d/.test(char))
        {
            numStr += char;
            continue;
        }

        break;
    }

    if(numStr) return +numStr * (isNegative ? -1 : 1);
    else return NaN;
}

class BubbleAbyss
{
    root: Bubble | null = null;
    top: Bubble | null = null;

    clear()
    {
        this.root = null;
        this.top = null;
    }

    blow(value: number): void
    {
        if(!this.top)
            this.root = this.top =
            {
                type: "SIMPLE",
                value,
                next: null,
                prev: null,
            }
        else
        {
            this.top = this.top.next = 
            {
                type: "SIMPLE",
                value,
                next: null,
                prev: this.top,
            }
        }
    }

    bigBlow(values: number[]): void
    {
        if(!values.length) return;

        let head: Bubble =
        {
            type: "SIMPLE",
            value: values.pop()!,
            next: null,
            prev: null,
        }

        for(let i = 0; i < values.length; i++)
        {
            head =
            {
                type: "SIMPLE",
                value: values[i],
                next: head,
                prev: null,
            }

            head.next!.prev = head;
        }

        if(!this.top)
        {
            this.root = this.top =
            {
                type: "DOUBLE",
                contents: head,
                next: null,
                prev: null,
            }
        }
        else
        {
            this.top = this.top.next =
            {
                type: "DOUBLE",
                contents: head,
                next: null,
                prev: this.top,
            }
        }
    }

    pop(subCommMode: boolean): number | number[] | void
    {
        if(!this.top) return;

        const popped = this.top;
        this.top = popped.prev;
        if(popped.prev) popped.prev.next = null;
        else this.root = null;
        
        if(popped.type === "SIMPLE") return popped.value;
        else if(subCommMode)
        {
            if(popped.contents) return this.recursivePopping(popped);
            else return [];
        }
        else if(popped.contents)
        {
            // Release content from double as bubbles
            if(this.top)
            {
                let tail: Bubble | null = popped.contents;
                while(tail.prev) tail = tail.prev;

                this.top.next = tail;
            }
            else this.root = popped.contents;
            this.top = popped.contents;
        }
    }

    recursivePopping(bubble: Bubble, valueStore: number[] = []): number[]
    {
        if(bubble.type === "SIMPLE") valueStore.push(bubble.value);
        else
        {
            let head: Bubble | null = bubble.contents;
            while(head) {
                this.recursivePopping(head, valueStore);
                head = head.prev as SimpleBubble;
            }
        }

        return valueStore;
    }

    submerge(by: number): void
    {
        const bubble = this.top;
        if(!bubble || !bubble.prev) return;

        if(by === 0) {
            this.top = bubble.prev;
            this.top.next = null;
            bubble.prev = null;
            bubble.next = this.root;
            this.root!.prev = bubble;
            this.root = bubble;
        }
        else
        {
            let front: Bubble | null = null,
                back: Bubble | null = bubble.prev;

            while(by > 0 && back)
            {
                front = back;
                back = back.prev;
            }

            this.top = bubble.prev;
            bubble.prev.next = null;

            if(front) front.prev = bubble;
            if(back) back.next = bubble;

            bubble.next = front;
            bubble.prev = back;
        }
    }

    duplicate(): void
    {
        if(!this.top) return;

        if(this.top.type === "SIMPLE") this.blow(this.top.value);
        else {
            const copy = this.recursiveDuplication(this.top, true)!;
            copy.prev = this.top;
            this.top = this.top.next = copy;
        }
    }

    recursiveDuplication(bubble: Bubble | null, isRoot: boolean): Bubble | null
    {
        if(!bubble) return null;

        const prev = isRoot ? null : this.recursiveDuplication(bubble.prev, false);
        const curr: Bubble = bubble.type === "SIMPLE" ? {
            type: "SIMPLE",
            value: bubble.value,
            next: null,
            prev,
        } : {
            type: "DOUBLE",
            contents: this.recursiveDuplication(bubble.contents, false),
            next: null,
            prev,
        };

        if(prev) prev.next = curr;
        return curr;
    }
    
    surround(count: number): void
    {
        if(!this.top) return;
        
        if(!count)
        {
            // Empty surround case
            this.top = this.top.next =
            {
                type: "DOUBLE",
                contents: null,
                next: null,
                prev: this.top,
            }
            return;
        }

        // Move to supposed root
        let tail = this.top;
        while(tail.prev && --count > 0)
        {
            tail = tail.prev;
        }
        
        // Transplant bubbles as double bubble content
        this.top = {
            type: "DOUBLE",
            contents: this.top,
            next: null,
            prev: tail.prev,
        }
        
        if(!tail.prev) this.root = this.top;
        else
        {
            tail.prev.next = this.top;
            tail.prev = null;
        }
    }

    merge(): void
    {
        if(!this.top || !this.top.prev) return;

        let front = this.top, back = this.top.prev;
        
        // Create and link double bubble
        const bubble: doubleBubble =
            {
                type: "DOUBLE",
                contents: null,
                next: null,
                prev: back.prev,
            }

        if(back.prev) {
            back.prev.next = bubble;
            back.prev = null;
        }
        else this.root = bubble;
        this.top = bubble;
            
        // Connect contents of new double bubble
        if(back.type === "SIMPLE") bubble.contents = back;
        else bubble.contents = back.contents;

        if(front.type === "SIMPLE" || front.contents)
        {
            if(bubble.contents)
            {
                let frontTail = front;
                if(front.type === "DOUBLE")
                {
                    frontTail = front.contents!;
                    while(frontTail.prev)
                    {
                        frontTail = frontTail.prev;
                    }
                }

                frontTail.prev = bubble.contents;
                bubble.contents.next = frontTail;
            }
            
            if(front.type === "SIMPLE") bubble.contents = front;
            else bubble.contents = front.contents;
        }
    }

    add(): void
    {
        if(!this.top || !this.top.prev) return;

        const a = this.top,
            b = this.top.prev,
            sum = this.recursiveMaths(a, b, (n: number, m: number) => ({
                type: "SIMPLE",
                value: n + m,
                next: null,
                prev: null,
            }));
        
        sum.prev = b.prev;
        if(b.prev) b.prev.next = sum;
        else this.root = sum;
        this.top = sum;
    }

    subtract(): void
    {
        if(!this.top || !this.top.prev) return;

        const a = this.top,
            b = this.top.prev,
            sum = this.recursiveMaths(a, b, (n: number, m: number) => ({
                type: "SIMPLE",
                value: n - m,
                next: null,
                prev: null,
            }));
        
        sum.prev = b.prev;
        if(b.prev) b.prev.next = sum;
        else this.root = sum;
        this.top = sum;
    }

    multiply(): void
    {
        if(!this.top || !this.top.prev) return;

        const a = this.top,
            b = this.top.prev,
            sum = this.recursiveMaths(a, b, (n: number, m: number) => ({
                type: "SIMPLE",
                value: n * m,
                next: null,
                prev: null,
            }));
        
        sum.prev = b.prev;
        if(b.prev) b.prev.next = sum;
        else this.root = sum;
        this.top = sum;
    }

    divide(): void
    {
        if(!this.top || !this.top.prev) return;

        const a = this.top,
            b = this.top.prev,
            sum = this.recursiveMaths(a, b, (n: number, m: number) => ({
                type: "DOUBLE",
                contents: {
                    type: "SIMPLE",
                    value: Math.floor(n / m),
                    next: null,
                    prev: {
                        type: "SIMPLE",
                        value: n % m,
                        next: null,
                        prev: null   
                    }
                },
                next: null,
                prev: null,
            }));
        
        sum.prev = b.prev;
        if(b.prev) b.prev.next = sum;
        else this.root = sum;
        this.top = sum;
    }

    recursiveMaths(a: Bubble, b: Bubble, mathOp: (n: number, m: number) => Bubble): Bubble
    {
        // smpl/smpl : do maths
        // dbl/dbl : zip through both abysses
        // smpl/dbl and dbl/smpl : apply smpl to dbl

        if(a.type === "SIMPLE" && b.type === "SIMPLE") return mathOp(a.value, b.value);

        if(a.type === "DOUBLE" && b.type === "DOUBLE")
        {
            let headA = a.contents,
                headB = b.contents,
                tmpHead: Bubble = {
                    type: "SIMPLE",
                    value: 0,
                    next: null,
                    prev: null,
                },
                tmpTail: Bubble = tmpHead;

            while(headA && headB)
            {
                const bubble = this.recursiveMaths(headA, headB, mathOp);
                tmpTail.prev = bubble;
                bubble.next = tmpTail;
                tmpTail = bubble;

                headA = headA.prev;
                headB = headB.prev;
            }

            return {
                type: "DOUBLE",
                contents: tmpHead.prev,
                next: null,
                prev: null,
            }
        }

        if(a.type === "DOUBLE" || b.type === "DOUBLE")
        {
            const smpl = a.type === "SIMPLE" ? a : b,
                dbl = a.type === "DOUBLE" ? a : b;

            let head = (dbl as doubleBubble).contents,
                tmpHead: Bubble = {
                    type: "SIMPLE",
                    value: 0,
                    next: null,
                    prev: null,
                },
                tmpTail: Bubble = tmpHead;

            while(head)
            {
                const bubble = a.type === "DOUBLE" ?
                    this.recursiveMaths(head, smpl, mathOp) :
                    this.recursiveMaths(smpl, head, mathOp);

                tmpTail.prev = bubble;
                bubble.next = tmpTail;
                tmpTail = bubble;

                head = head.prev;
            }

            return {
                type: "DOUBLE",
                contents: tmpHead.prev,
                next: null,
                prev: null,
            }
        }
        
        throw new Error("IMPOSSIBLE BUBBLE TYPES AWAWAWAWA");
    }

    countTopContaining(): number
    {
        if(!this.top || this.top.type === "SIMPLE") return 0;
        
        let head = this.top.contents,
            cnt = 0;
        while(head)
        {
            cnt++;
            head = head.prev;
        }

        return cnt;
    }

    isEqual(): boolean
    {
        const a = this.top;
        if(!a || a.type === "DOUBLE" || !a.prev) return false;
        const b = a.prev;
        if(b.type === "DOUBLE") return false;
        return a.value === b.value;
    }

    isLessThan(): boolean
    {
        const a = this.top;
        if(!a || a.type === "DOUBLE" || !a.prev) return false;
        const b = a.prev;
        if(b.type === "DOUBLE") return false;
        return a.value < b.value;
    }

    isGreaterThan(): boolean
    {
        const a = this.top;
        if(!a || a.type === "DOUBLE" || !a.prev) return false;
        const b = a.prev;
        if(b.type === "DOUBLE") return false;
        return a.value > b.value;
    }
    
    convertToNestedLists(bubble: Bubble | null = this.top): NestedNumberArray
    {
        if(!bubble) return []
        if(bubble.type === "SIMPLE") return [...this.convertToNestedLists(bubble.prev), bubble.value];
        return [...this.convertToNestedLists(bubble.prev), this.convertToNestedLists(bubble.contents)];
    }
}

export type InputCallback = (type: "STRING" | "NUMBER") => Promise<string>;
export type OutputCallback = (awaOutput: string) => void;
export class AwaInterpreter
{
    #awatokens: number[] = [];
    #awaindex = 0;
    #executionTime = 0;

    #getInput: InputCallback | null = null;
    #sendOutput: OutputCallback | null = null;

    #labelIndices = new Map<number, number>();
    #bubbleAbyss = new BubbleAbyss;
    #charMap: CharacterMapping;

    get awaindex(): number { return this.#awaindex; }
    get awatokens(): readonly number[] { return this.#awatokens }
    get executionTime(): number { return this.#executionTime; }
    get hasFinished(): boolean { return this.#awaindex >= this.#awatokens.length };

    public UseAwatalk(awatalk: string): void
    {
        this.#awaindex = 0;
        this.#executionTime = 0;
        this.#charMap = AwaSCII;
        this.#bubbleAbyss.clear();

        const awabits = parseAwas(awatalk);
        this.#awatokens = tokenizeAwas(awabits, false);
        this.StoreLabelIndices()
    }

    public UseInputCallback(cb: InputCallback): void
    {
        this.#getInput = cb;
    }

    public UseOutputCallback(cb: OutputCallback): void
    {
        this.#sendOutput = cb;
    }

    public async step(): Promise<void>
    {
        if(this.#awaindex >= this.#awatokens.length) return;

        this.#executionTime++;

        const bubbleAbyss = this.#bubbleAbyss,
            awatokens = this.#awatokens,
            awaToken = awatokens[this.#awaindex++];

        switch(awaToken)
        {
            case AWATISMS["NOP"]: // NO-OP
                break;

            case AWATISMS["PRN"]: {
                if(!this.#sendOutput) break;
                const bubbles = bubbleAbyss.pop(true);

                if(typeof bubbles === "number")
                {
                    const char = this.#charMap.codeToChar[bubbles];
                    if(char) this.#sendOutput(char);
                }
                else if(bubbles)
                {
                    const chars = convertCharCodesToString(bubbles, this.#charMap);
                    this.#sendOutput(chars);
                }}break;

            case AWATISMS["PR1"]: {
                if(!this.#sendOutput) break;

                const bubbles = bubbleAbyss.pop(true);
                let chars: string;

                if(typeof bubbles === "number") chars = bubbles.toString();
                else if(bubbles) chars = bubbles.join(" ");
                else break;

                this.#sendOutput(chars + " ")
                }break;

            case AWATISMS["RED"]: {
                if(!this.#getInput) break;
                const inputStr = await this.#getInput("STRING");
                bubbleAbyss.bigBlow(convertStringToCharCodes(inputStr, this.#charMap));
                }break;

            case AWATISMS["R3D"]: {
                if(!this.#getInput) break;
                const inputStr = await this.#getInput("NUMBER");
                bubbleAbyss.blow(readNumberFromString(inputStr));
                }break;

            case AWATISMS["BLO"]:
                bubbleAbyss.blow(awatokens[this.#awaindex++]);
                break;

            case AWATISMS["SBM"]:
                bubbleAbyss.submerge(awatokens[this.#awaindex++]);
                break;

            case AWATISMS["POP"]:
                bubbleAbyss.pop(false);
                break;

            case AWATISMS["DPL"]:
                bubbleAbyss.duplicate();
                break;

            case AWATISMS["SRN"]:
                bubbleAbyss.surround(awatokens[this.#awaindex++]);
                break;

            case AWATISMS["MRG"]:
                bubbleAbyss.merge();
                break;

            case AWATISMS["4DD"]:
                bubbleAbyss.add();
                break;

            case AWATISMS["SUB"]:
                bubbleAbyss.subtract();
                break;

            case AWATISMS["MUL"]:
                bubbleAbyss.multiply();
                break;

            case AWATISMS["DIV"]:
                bubbleAbyss.divide();
                break;

            case AWATISMS["CNT"]:
                bubbleAbyss.blow(bubbleAbyss.countTopContaining());
                break;

            case AWATISMS["LBL"]:
                this.#awaindex++; // skip param token
                break;

            case AWATISMS["JMP"]:
                this.#awaindex = this.#labelIndices.get(awatokens[this.#awaindex]) ?? (this.#awaindex + 1);
                break;

            case AWATISMS["EQL"]:
            case AWATISMS["LSS"]:
            case AWATISMS["GR8"]:
                if(awaToken === AWATISMS["EQL"] && bubbleAbyss.isEqual()) break;
                if(awaToken === AWATISMS["LSS"] && bubbleAbyss.isLessThan()) break;
                if(awaToken === AWATISMS["GR8"] && bubbleAbyss.isGreaterThan()) break;
                
                // Skip to next next token if next token takes param
                if(paramedAwatisms.has(awatokens[this.#awaindex++])) this.#awaindex++;
                break;

            case AWATISMS["CWA"]:
                this.switchCharMap(awatokens[this.#awaindex++]);
                break;

            case AWATISMS["BY8"]: // ignore; compiler-only
                break;

            case AWATISMS["TRM"]:
                this.#awaindex = awatokens.length;
                break;
        }
    }

    public async run(
        runPostStep: () => any,
        shouldHalt: () => Promise<boolean>,
        yieldToWorker: () => Promise<void>,
    ): Promise<void>
    {
        const quantumMax = 10;
        let quantum = 0;

        while(this.#awaindex < this.#awatokens.length)
        {
            await this.step();
            runPostStep();
            if(await shouldHalt()) break;
            if(++quantum >= quantumMax)
            {
                await yieldToWorker();
                quantum = 0;
            }
        }
    }

    private switchCharMap(key: number): void
    {
        switch (key) {
            case 0:
            default:
                this.#charMap = AwaSCII;
                break;
            
            // TODO: add common and extended awascii mappings
            
            case 3:
                this.#charMap = FullerAwaSCII;
                break;
        }
    }

    private StoreLabelIndices(): void
    {
        this.#labelIndices.clear();

        const awatokens = this.#awatokens;
        let i = 0;

        while(i < awatokens.length)
        {
            const token = awatokens[i++];
            if(paramedAwatisms.has(token)) i++;
            if(token !== AWATISMS.LBL) continue;
            const labelIndex = awatokens[i - 1];
            this.#labelIndices.set(labelIndex, i);
        }
    }

    public getBubblesList(): NestedNumberArray
    {
        return this.#bubbleAbyss.convertToNestedLists();
    }
}
