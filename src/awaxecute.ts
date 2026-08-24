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

const AwaSCII_MAP = new Map([
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
])

type Bubble = SimpleBubble | doubleBubble;
interface SimpleBubble
{
    next: Bubble | null;
    prev: Bubble | null;
    type: "SIMPLE";
    value: number;
}
interface doubleBubble
{
    next: Bubble | null;
    prev: Bubble | null;
    type: "DOUBLE";
    contents: SimpleBubble;
}

const BubbleAbyss =
{
    root: null as Bubble | null,
    top: null as Bubble | null,

    blow(value: number): void
    {
        if(!this.top)
            this.root = this.top = {
                type: "SIMPLE",
                value,
                next: null,
                prev: null,
            }
        else
        {
            const newTop: Bubble = {
                type: "SIMPLE",
                value,
                next: null,
                prev: this.top,
            }

            this.top = this.top.next = newTop;
        }
    },

    pop(subCommMode: boolean): number | number[] | void
    {
        if(!this.top) return;

        const popped = this.top;
        this.top = popped.prev;
        
        if(popped.type === "SIMPLE") return popped.value;
        else if(subCommMode)
        {
            const values: number[] = [];
            
            let head: SimpleBubble | null = popped.contents;
            while(head) {
                values.push(head.value);
                head = head.next as SimpleBubble;
            }

            return values;
        }
        else
        {
            if(this.top) this.top.next = popped.contents;

            let head: Bubble | null = popped.contents;
            while(head) head = head.next;
            this.top = head;
        }
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
}

function
executeAwas(awaTokens: number[]): string
{
    let output = "",
        i = 0;

    for(; i < awaTokens.length; i++)
    {
        const awaToken = awaTokens[i];
        switch(awaToken)
        {
            case AWATISMS.NOP: // NO-OP
                break;

            case AWATISMS.PRN: {
                const bubbles = BubbleAbyss.pop(true);
                if(typeof bubbles === "number") output += AwaSCII_MAP.get(bubbles) ?? "";
                else if(bubbles)
                {
                    let hasAdded = false,
                        i = 0,
                        code: number,
                        char: string | undefined;

                    for(; i < bubbles.length; i++)
                    {
                        code = bubbles[i];
                        char = AwaSCII_MAP.get(code);
                        if(char)
                        {
                            if(hasAdded) output += " ";
                            output += char;
                            hasAdded = true;
                        }
                    }
                }}break;

            case AWATISMS.PR1:
                const bubbles = BubbleAbyss.pop(true);
                if(typeof bubbles === "number") output += bubbles;
                else if(bubbles) output += bubbles.join(" ");
                break;

            case AWATISMS.RED:
                break;

            case AWATISMS.R3D:
                break;

            case AWATISMS.BLO:
                break;

            case AWATISMS.SBM:
                break;

            case AWATISMS.POP:
                break;

            case AWATISMS.DPL:
                break;

            case AWATISMS.SRN:
                break;

            case AWATISMS.MRG:
                break;

            case AWATISMS.ADD:
                break;

            case AWATISMS.SUB:
                break;

            case AWATISMS.MUL:
                break;

            case AWATISMS.DIV:
                break;

            case AWATISMS.CNT:
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

    return output;
}