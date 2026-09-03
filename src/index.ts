function main(): void
{
    const awatalkInput = document.querySelector("#awatalk") as HTMLTextAreaElement;
    const awaOutputEl = document.querySelector("#awaout") as HTMLTextAreaElement;
    const runScriptBtn = document.querySelector(".run") as HTMLButtonElement;
    const stepScriptBtn = document.querySelector(".step") as HTMLButtonElement;
    
    // I/O METHODS
    function
    onInput(type: "NUMBER" | "STRING"): Promise<string>
    {
        return new Promise<string>((res) =>
        {
            // yeah prompt is blocking, but just following style here
            res(prompt(`SUPPLY ${type} AS INPUT`) ?? "");
        })
    }

    function
    onOutput(out: string): void
    {
        awaOutputEl.value += out;
    }

    function
    clearOutput(): void
    {
        awaOutputEl.value = "";
    }
    
    // AWAXECUTION
    const awaInterpreter = new AwaInterpreter;
    awaInterpreter.UseInputCallback(onInput);
    awaInterpreter.UseOutputCallback(onOutput);

    let isUsingFreshAwatalk = false;

    // EVENT LISTENERS
    runScriptBtn.addEventListener("click", () =>
    {
        if(!isUsingFreshAwatalk)
        {
            clearOutput();
            awaInterpreter.UseAwatalk(awatalkInput.value);
            isUsingFreshAwatalk = true;
        }

        awaInterpreter.run();
        awaInterpreter.DEBUG_PrettyPrintBubbles();
    })
    
    stepScriptBtn.addEventListener("click", () =>
    {
        if(!isUsingFreshAwatalk)
        {
            clearOutput();
            awaInterpreter.UseAwatalk(awatalkInput.value);
            isUsingFreshAwatalk = true;
        }

        awaInterpreter.step();
        awaInterpreter.DEBUG_PrettyPrintBubbles();
    })

    // Invalidate stored awatalk
    awatalkInput.addEventListener("input", () => isUsingFreshAwatalk = false);

    // Init
    clearOutput();
}

main();
