// const tokens =
// {
//     0b00000: "nop",
//     0b00001: "prn",
//     0b00010: "pr1",
//     0b00011: "red",
//     0b00100: "r3d",
//     0b00101: "blo",
//     0b00110: "sbm",
//     0b00111: "pop",
//     0b01000: "dpl",
//     0b01001: "srn",
//     0b01010: "mrg",
//     0b01011: "4dd",
//     0b01100: "sub",
//     0b01101: "mul",
//     0b01110: "div",
//     0b01111: "cnt",
//     0b10000: "lbl",
//     0b10001: "jmp",
//     0b10010: "eql",
//     0b10011: "lss",
//     0b10100: "gr8",
//     0b11111: "trm",
// }

const tokenizeAwas = (() => {
    const tokenParams = new Map([
        [0x05, true],
        [0x06, false],
        [0x09, false],
        [0x10, false],
    ]);

    return function
        (awaBools: boolean[]): number[]
        {
            const tokens: number[] = [];
            let currToken = 0,
                groupUntil = 5,
                isSigned = false;
            
            for(const bool of awaBools)
            {
                currToken = (currToken << 1) | (bool ? 1 : 0);

                if(--groupUntil <= 0)
                {
                    if(isSigned && currToken & 0x80)
                    {
                        currToken = ~(currToken & 0x7f) + 1;
                    }
                    isSigned = false;

                    tokens.push(currToken);

                    const signFlag = tokenParams.get(currToken);
                    if(signFlag !== undefined)
                    {
                        groupUntil = 8;
                        isSigned = signFlag;
                    }
                    else
                    {
                        groupUntil = 5;
                    }
                    
                    currToken = 0;
                }
            }

            return tokens;
        }
})()