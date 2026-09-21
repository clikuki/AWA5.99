export const tokenizeAwas = (() => {
    const tokenParams = new Map([
        // TRUE  = signed   8 bit parameter
        // FALSE = unsigned 5 bit parameter (unless forced 8 bit sized is enabled)
        [0x05, true],
        [0x06, false],
        [0x09, false],
        [0x10, false],
        [0x11, false],
        [0x1D, false],
    ]);

    return function
        (awabits: boolean[], useEightSizedBytes: boolean): number[]
        {
            const awatokens: number[] = [];
            let currToken = 0,
                groupUntil = 5,
                isSigned = false,
                isParam = false;
            
            for(const bit of awabits)
            {
                currToken = (currToken << 1) | (bit ? 1 : 0);

                if(--groupUntil <= 0)
                {
                    if(isSigned && currToken & 0x80)
                    {
                        // Undo the negative sign in 8-bit form through two's complement,
                        // then convert into javascript negative
                        currToken = -((~currToken & 0x7f) + 1);
                    }
                    
                    awatokens.push(currToken);

                    // Fix state
                    isSigned = false;
                    groupUntil = 5;

                    if(isParam) isParam = false;
                    else
                    {
                        const isSignedEightBit = tokenParams.get(currToken);
                        if(isSignedEightBit !== undefined)
                        {
                            isParam = true;
                            isSigned = isSignedEightBit;
                            
                            if(isSignedEightBit || useEightSizedBytes) groupUntil = 8;
                        }
                    }
                    
                    currToken = 0;
                }
            }

            return awatokens;
        }
})()
