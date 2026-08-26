const enum AWATISMS {
    NOP = 0b00000,
    PRN = 0b00001,
    PR1 = 0b00010,
    RED = 0b00011,
    R3D = 0b00100,
    BLO = 0b00101,
    SBM = 0b00110,
    POP = 0b00111,
    DPL = 0b01000,
    SRN = 0b01001,
    MRG = 0b01010,
    ADD = 0b01011, // i cant do 4dd as a name :(
    SUB = 0b01100,
    MUL = 0b01101,
    DIV = 0b01110,
    CNT = 0b01111,
    LBL = 0b10000,
    JMP = 0b10001,
    EQL = 0b10010,
    LSS = 0b10011,
    GR8 = 0b10100,
    TRM = 0b11111,
}

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

const BubbleAbyss =
{
    root: null as Bubble | null,
    top: null as Bubble | null,

    clear()
    {
        this.root = null;
        this.top = null;
    },

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
    },

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

        while(values.length)
        {
            head =
            {
                type: "SIMPLE",
                value: values.pop()!,
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
    },

    pop(subCommMode: boolean): number | number[] | void
    {
        if(!this.top) return;

        const popped = this.top;
        this.top = popped.prev;
        
        if(popped.type === "SIMPLE") return popped.value;
        else if(subCommMode) return this.recursivePopping(popped).reverse(); // Remove double bubble and return content
        else
        {
            // Release content from double as bubbles
            if(this.top) this.top.next = popped.contents;

            let head: Bubble | null = popped.contents;
            while(head) head = head.next;
            this.top = head;
        }
    },

    recursivePopping(bubble: Bubble, valueStore: number[] = []): number[]
    {
        if(bubble.type === "SIMPLE") valueStore.push(bubble.value);
        else
        {
            let head: Bubble | null = bubble.contents;
            while(head) {
                this.recursivePopping(head, valueStore);
                head = head.next as SimpleBubble;
            }
        }

        return valueStore;
    },

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
            let next: Bubble | null = null,
                prev: Bubble | null = bubble.prev;

            while(by > 0 && prev)
            {
                next = prev;
                prev = prev.prev;
            }

            this.top = bubble.prev;
            bubble.prev.next = null;

            if(next) next.prev = bubble;
            if(prev) prev.next = bubble;

            bubble.next = next;
            bubble.prev = prev;
        }
    },

    duplicate(): void
    {
        if(!this.top) return;

        if(this.top.type === "SIMPLE") this.blow(this.top.value);
        else {
            const copy = this.recursiveDuplication(this.top, true)!;
            copy.prev = this.top;
            this.top = this.top.next = copy;
        }
    },

    recursiveDuplication(bubble: Bubble | null, isRoot: boolean): Bubble | null
    {
        if(!bubble) return null;

        const next = isRoot ? null : this.recursiveDuplication(bubble.next, false);
        const curr: Bubble = bubble.type === "SIMPLE" ? {
            type: "SIMPLE",
            value: bubble.value,
            next,
            prev: null,
        } : {
            type: "DOUBLE",
            contents: this.recursiveDuplication(bubble.contents, false),
            next,
            prev: null,
        };

        if(next) next.prev = curr;
        return curr;
    },
    
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
        let head = this.top;
        while(head.prev && --count > 0)
        {
            head = head.prev;
        }
        
        // Transplant bubbles as double bubble content
        this.top = {
            type: "DOUBLE",
            contents: head,
            next: null,
            prev: head.prev,
        }
        
        if(!head.prev) this.root = this.top;
        else
        {
            head.prev.next = this.top;
            head.prev = null;
        }
    },

    merge(): void
    {
        if(!this.top || !this.top.prev) return;

        let a = this.top, b = this.top.prev;
        
        // Create and link double bubble
        const bubble: doubleBubble =
            {
                type: "DOUBLE",
                contents: null,
                next: null,
                prev: b.prev,
            }

        if(b.prev) b.prev.next = bubble;
        this.top = bubble;
            
        // Connect contents of new double bubble
        if(a.type === "SIMPLE") bubble.contents = a;
        else bubble.contents = a.contents;

        if(b.type === "SIMPLE")
        {
            if(bubble.contents)
            {
                b.next = bubble.contents;
                bubble.contents.prev = b;
            }

            bubble.contents = b;
        }
        else if(b.contents)
        {
            if(bubble.contents)
            {
                // Connect head of b to tail of a
                let head = b.contents;
                while(head.next)
                {
                    head = head.next
                }

                head.next = bubble.contents;
                bubble.contents.prev = head;
            }

            bubble.contents = b.contents;
        }
    },

    add(): void
    {
        if(!this.top || !this.top.prev) return;

        // TODO: support dbl/dbl add operations
        const a = this.top, b = this.top.prev;
        console.log(a,b);

        if(a.type === "SIMPLE" && b.type === "SIMPLE")
        {
            this.top =
                {
                    type: "SIMPLE",
                    value: a.value + b.value,
                    next: null,
                    prev: b.prev   
                }
            
            if(b.prev) b.prev.next = this.top
            else this.root = this.top;
        }
        else if(a.type === "SIMPLE" && b.type === "DOUBLE")
        {
            this.recursiveAdd(b, a.value);
            b.next = null;
            this.top = b;
        }
        else if(a.type === "DOUBLE" && b.type === "SIMPLE")
        {
            this.recursiveAdd(a, b.value);
            a.prev = b.prev;
            if(b.prev) b.prev.next = a;
            else this.root = a;
        }
    },

    recursiveAdd(bubble: Bubble, value: number): void
    {
        if(bubble.type === "SIMPLE") bubble.value += value;
        else
        {
            let head: Bubble | null = bubble.contents;
            while(head)
            {
                this.recursiveAdd(head, value);
                head = head.next;
            }
        }
    },

    countTopContaining(): number
    {
        if(!this.top || this.top.type === "SIMPLE") return 0;
        
        let head = this.top.contents,
            cnt = 0;
        while(head)
        {
            cnt++;
            head = head.next;
        }

        return cnt;
    },
}

async function
executeAwas(
    awaTokens: number[],
    getInput: (type: "STRING" | "NUMBER") => Promise<string>,
    sendOutput: (awaOutput: string) => void,
): Promise<void>
{
    console.log(awaTokens);
    BubbleAbyss.clear();
    let i = 0;

    for(; i < awaTokens.length; i++)
    {
        const awaToken = awaTokens[i];
        switch(awaToken)
        {
            case AWATISMS.NOP: // NO-OP
                break;

            case AWATISMS.PRN: {
                const bubbles = BubbleAbyss.pop(true);
                if(typeof bubbles === "number") sendOutput(AwaSCII.codeToChar.get(bubbles) ?? "");
                else if(bubbles) sendOutput(convertAwaSCIICodesToString(bubbles));
                }break;

            case AWATISMS.PR1: {
                const bubbles = BubbleAbyss.pop(true);
                if(typeof bubbles === "number") sendOutput(bubbles.toString());
                else if(bubbles) sendOutput(bubbles.join(" "));
                }break;

            case AWATISMS.RED: {
                const inputStr = await getInput("STRING");
                BubbleAbyss.bigBlow(convertStringToAwaSCIICodes(inputStr));
                }break;

            case AWATISMS.R3D: {
                const inputStr = await getInput("NUMBER");
                BubbleAbyss.blow(readNumberFromString(inputStr));
                }break;

            case AWATISMS.BLO:
                BubbleAbyss.blow(awaTokens[++i]);
                break;

            case AWATISMS.SBM:
                BubbleAbyss.submerge(awaTokens[++i]);
                break;

            case AWATISMS.POP:
                BubbleAbyss.pop(false);
                break;

            case AWATISMS.DPL:
                BubbleAbyss.duplicate();
                break;

            case AWATISMS.SRN:
                BubbleAbyss.surround(awaTokens[++i]);
                break;

            case AWATISMS.MRG:
                BubbleAbyss.merge();
                break;

            case AWATISMS.ADD:
                BubbleAbyss.add();
                break;

            case AWATISMS.SUB:
                break;

            case AWATISMS.MUL:
                break;

            case AWATISMS.DIV:
                break;

            case AWATISMS.CNT:
                BubbleAbyss.blow(BubbleAbyss.countTopContaining());
                break;

            case AWATISMS.LBL:
                break;

            case AWATISMS.JMP:
                break;

            case AWATISMS.EQL:
                break;

            case AWATISMS.LSS:
                break;

            case AWATISMS.GR8:
                break;

            case AWATISMS.TRM:
                break;

        }
    }
}