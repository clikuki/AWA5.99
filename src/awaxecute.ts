const enum AWATISMS {
    "NOP" = 0b00000,
    "PRN" = 0b00001,
    "PR1" = 0b00010,
    "RED" = 0b00011,
    "R3D" = 0b00100,
    "BLO" = 0b00101,
    "SBM" = 0b00110,
    "POP" = 0b00111,
    "DPL" = 0b01000,
    "SRN" = 0b01001,
    "MRG" = 0b01010,
    "4DD" = 0b01011,
    "SUB" = 0b01100,
    "MUL" = 0b01101,
    "DIV" = 0b01110,
    "CNT" = 0b01111,
    "LBL" = 0b10000,
    "JMP" = 0b10001,
    "EQL" = 0b10010,
    "LSS" = 0b10011,
    "GR8" = 0b10100,
    "TRM" = 0b11111,
}

const AWATISM_CODE_COMMANDS: Record<number, string> = {
    0b00000: "NOP",
    0b00001: "PRN",
    0b00010: "PR1",
    0b00011: "RED",
    0b00100: "R3D",
    0b00101: "BLO",
    0b00110: "SBM",
    0b00111: "POP",
    0b01000: "DPL",
    0b01001: "SRN",
    0b01010: "MRG",
    0b01011: "4DD",
    0b01100: "SUB",
    0b01101: "MUL",
    0b01110: "DIV",
    0b01111: "CNT",
    0b10000: "LBL",
    0b10001: "JMP",
    0b10010: "EQL",
    0b10011: "LSS",
    0b10100: "GR8",
    0b11111: "TRM",
}

const paramedAwatisms = [
    AWATISMS.BLO,
    AWATISMS.SBM,
    AWATISMS.SRN,
    AWATISMS.JMP,
    AWATISMS.LBL,
];

const AwaSCII =
{
    codeToChar: new Map([
        [0x00, "A"],
        [0x01, "W"],
        [0x02, "a"],
        [0x03, "w"],
        [0x04, "J"],
        [0x05, "E"],
        [0x06, "L"],
        [0x07, "Y"],
        [0x08, "H"],
        [0x09, "O"],
        [0x0A, "S"],
        [0x0B, "I"],
        [0x0C, "U"],
        [0x0D, "M"],
        [0x0E, "j"],
        [0x0F, "e"],
        [0x10, "l"],
        [0x11, "y"],
        [0x12, "h"],
        [0x13, "o"],
        [0x14, "s"],
        [0x15, "i"],
        [0x16, "u"],
        [0x17, "m"],
        [0x18, "P"],
        [0x19, "C"],
        [0x1A, "N"],
        [0x1B, "T"],
        [0x1C, "p"],
        [0x1D, "c"],
        [0x1E, "n"],
        [0x1F, "t"],
        [0x20, "B"],
        [0x21, "D"],
        [0x22, "F"],
        [0x23, "G"],
        [0x24, "R"],
        [0x25, "b"],
        [0x26, "d"],
        [0x27, "f"],
        [0x28, "g"],
        [0x29, "r"],
        [0x2A, "0"],
        [0x2B, "1"],
        [0x2C, "2"],
        [0x2D, "3"],
        [0x2E, "4"],
        [0x2F, "5"],
        [0x30, "6"],
        [0x31, "7"],
        [0x32, "8"],
        [0x33, "9"],
        [0x34, " "],
        [0x35, "."],
        [0x36, ","],
        [0x37, "!"],
        [0x38, "'"],
        [0x39, "("],
        [0x3A, ")"],
        [0x3B, "~"],
        [0x3C, "_"],
        [0x3D, "/"],
        [0x3E, ";"],
        [0x3F, "\n"],
    ]),
    charToCode: new Map([
        ["A", 0x00],
        ["W", 0x01],
        ["a", 0x02],
        ["w", 0x03],
        ["J", 0x04],
        ["E", 0x05],
        ["L", 0x06],
        ["Y", 0x07],
        ["H", 0x08],
        ["O", 0x09],
        ["S", 0x0A],
        ["I", 0x0B],
        ["U", 0x0C],
        ["M", 0x0D],
        ["j", 0x0E],
        ["e", 0x0F],
        ["l", 0x10],
        ["y", 0x11],
        ["h", 0x12],
        ["o", 0x13],
        ["s", 0x14],
        ["i", 0x15],
        ["u", 0x16],
        ["m", 0x17],
        ["P", 0x18],
        ["C", 0x19],
        ["N", 0x1A],
        ["T", 0x1B],
        ["p", 0x1C],
        ["c", 0x1D],
        ["n", 0x1E],
        ["t", 0x1F],
        ["B", 0x20],
        ["D", 0x21],
        ["F", 0x22],
        ["G", 0x23],
        ["R", 0x24],
        ["b", 0x25],
        ["d", 0x26],
        ["f", 0x27],
        ["g", 0x28],
        ["r", 0x29],
        ["0", 0x2A],
        ["1", 0x2B],
        ["2", 0x2C],
        ["3", 0x2D],
        ["4", 0x2E],
        ["5", 0x2F],
        ["6", 0x30],
        ["7", 0x31],
        ["8", 0x32],
        ["9", 0x33],
        [" ", 0x34],
        [".", 0x35],
        [",", 0x36],
        ["!", 0x37],
        ["'", 0x38],
        ["(", 0x39],
        [")", 0x3A],
        ["~", 0x3B],
        ["_", 0x3C],
        ["/", 0x3D],
        [";", 0x3E],
        ["\n", 0x3F],
    ]),
}

function
convertStringToAwaSCIICodes(str: string): number[]
{
    const codes: number[] = [];

    for(const char of str)
    {
        const code = AwaSCII.charToCode.get(char);
        if(code === undefined) continue;
        codes.push(code);
    }

    return codes;
}

function
convertAwaSCIICodesToString(codes: number[]): string
{
    let output = "",
        i = 0,
        code: number,
        char: string | undefined;

    for(; i < codes.length; i++)
    {
        code = codes[i];
        char = AwaSCII.codeToChar.get(code);
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

type Bubble = SimpleBubble | doubleBubble;
interface SimpleBubble
{
    type: "SIMPLE";
    value: number;
    next: Bubble | null;
    prev: Bubble | null;
}
interface doubleBubble
{
    type: "DOUBLE";
    contents: Bubble | null;
    next: Bubble | null;
    prev: Bubble | null;
}

type NestedNumberArray = (NestedNumberArray | number)[];

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

            debugger;
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

type InputCallback = (type: "STRING" | "NUMBER") => Promise<string>;
type OutputCallback = (awaOutput: string) => void;
class AwaInterpreter
{
    #awatokens: number[] = [];
    #awaindex = 0;
    #executionTime = 0;

    #getInput: InputCallback | null = null;
    #sendOutput: OutputCallback | null = null;

    #labelIndices = new Map<number, number>();
    #bubbleAbyss = new BubbleAbyss;

    get awaindex(): number { return this.#awaindex; }
    get awatokens(): readonly number[] { return this.#awatokens }
    get executionTime(): number { return this.#executionTime; }

    public UseAwatalk(awatalk: string): void
    {
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
        this.#executionTime++;

        const bubbleAbyss = this.#bubbleAbyss,
            awatokens = this.#awatokens,
            awaToken = awatokens[this.#awaindex++];

        switch(awaToken)
        {
            case AWATISMS["NOP"]: // NO-OP
                break;

            case AWATISMS["PRN"]: {
                const bubbles = bubbleAbyss.pop(true);
                if(typeof bubbles === "number") this.#sendOutput?.(AwaSCII.codeToChar.get(bubbles) ?? "");
                else if(bubbles) this.#sendOutput?.(convertAwaSCIICodesToString(bubbles));
                }break;

            case AWATISMS["PR1"]: {
                const bubbles = bubbleAbyss.pop(true);
                if(typeof bubbles === "number") this.#sendOutput?.(bubbles.toString() + " ");
                else if(bubbles) this.#sendOutput?.(bubbles.join(" ") + " ");
                }break;

            case AWATISMS["RED"]:
                this.#getInput?.("STRING").then(inputStr => {
                    bubbleAbyss.bigBlow(convertStringToAwaSCIICodes(inputStr));
                })
                break;

            case AWATISMS["R3D"]:
                this.#getInput?.("STRING").then(inputStr => {
                    bubbleAbyss.blow(readNumberFromString(inputStr));
                })
                break;

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
                if(paramedAwatisms.includes(awatokens[this.#awaindex++])) this.#awaindex++;
                break;

            case AWATISMS["TRM"]:
                this.#awaindex = awatokens.length;
                break;
        }
    }

    public run(): void
    {
        while(this.#awaindex < this.#awatokens.length)
        {
            this.step();
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
            if(paramedAwatisms.includes(token)) i++;
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
