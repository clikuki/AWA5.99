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
            const awaTokens: number[] = [];
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

                    awaTokens.push(currToken);

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

            return awaTokens;
        }
})()