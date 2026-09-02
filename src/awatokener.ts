const tokenizeAwas = (() => {
    const tokenParams = new Map([
        // 0b01 to designate original 8-bit byte size based on AWA5.0 specs
        // 0b10 to designate signed integer type
        [0x05, 0b01],
        [0x06, 0b10],
        [0x09, 0b10],
        [0x10, 0b10],
        [0x11, 0b10],
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
                        const paramFlags = tokenParams.get(currToken);
                        if(paramFlags !== undefined)
                        {
                            isParam = true;
                            isSigned = Boolean(paramFlags & 0b01);
                            
                            const isEightSized = paramFlags & 0b01;
                            if(isEightSized || useEightSizedBytes) groupUntil = 8;
                        }
                    }
                            
                    currToken = 0;
                }
            }

            return awatokens;
        }
})()
