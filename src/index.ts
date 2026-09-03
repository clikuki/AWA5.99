function main(): void
{
    const awatalkInput = document.querySelector("#awatalk") as HTMLTextAreaElement;
    const awaOutputEl = document.querySelector("#awaout") as HTMLTextAreaElement;
    const runScriptBtn = document.querySelector(".run") as HTMLButtonElement;
    const stepScriptBtn = document.querySelector(".step") as HTMLButtonElement;
    const tokenCountEl = document.querySelector(".tokenCount") as HTMLSpanElement;
    const executionTimeEl = document.querySelector(".executionTime") as HTMLSpanElement;
    const commandsListEl = document.querySelector(".commands") as HTMLOListElement;
    
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

    let isUsingLatestAwatalk = false;

    function
    updateStats(): void
    {
        tokenCountEl.textContent = String(awaInterpreter.awatokens.length);
        executionTimeEl.textContent = String(awaInterpreter.executionTime);
    }

    function
    updateCommandsList(): void
    {
        const newCommands: HTMLLIElement[] = [],
            awatokens = awaInterpreter.awatokens;
        for(let i = 0; i < awatokens.length; i++)
        {
            const token = awatokens[i];
            let content = AWATISM_CODE_COMMANDS[token];

            if(paramedAwatisms.includes(token)) {
                if(i >= awatokens.length - 1) content += " ?";
                else content += " " + awatokens[++i];
            }

            const cmdEl = document.createElement("li");
            cmdEl.textContent = content;
            newCommands.push(cmdEl);
        }

        commandsListEl.replaceChildren(...newCommands);
    }

    function
    preExecutionSteps(): void
    {
        if(isUsingLatestAwatalk) return;
        isUsingLatestAwatalk = true;

        clearOutput();
        awaInterpreter.UseAwatalk(awatalkInput.value);
        updateCommandsList();
    }

    // EVENT LISTENERS
    runScriptBtn.addEventListener("click", () =>
    {
        preExecutionSteps();
        awaInterpreter.run();
        awaInterpreter.DEBUG_PrettyPrintBubbles();
        updateStats();
    })
    
    stepScriptBtn.addEventListener("click", () =>
    {
        preExecutionSteps();
        awaInterpreter.step();
        awaInterpreter.DEBUG_PrettyPrintBubbles();
        updateStats();
    })

    // Invalidate stored awatalk
    awatalkInput.addEventListener("input", () => isUsingLatestAwatalk = false);

    // Init
    clearOutput();
}

main();
