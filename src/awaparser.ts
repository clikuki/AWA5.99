function
parseAwas(awatalk: string): boolean[]
{
    const bitArray: boolean[] = [];
    const matchAgainst = "AWA";

    let matchIdx = 0,
        foundChecksumAwa = false,
        inAwaSequence = false,
        i = 0,
        char: string;

    for(; i < awatalk.length; i++)
    {
        char = awatalk[i].toUpperCase();

        if(char === " ")
        {
            matchIdx = 0;
            inAwaSequence = false;
        }

        if(char !== matchAgainst[matchIdx])
        {
            matchIdx = 0;
        }
        else if(++matchIdx > 2)
        {
            matchIdx = 1;

            if(inAwaSequence)
            {
                bitArray.push(true);
            }
            else if(foundChecksumAwa)
            {
                inAwaSequence = true;
                bitArray.push(false);
            }
            else
            {
                foundChecksumAwa = true;
            }
        }
    }

    return bitArray;
}