function main(): void
{
    const awatalkInput = document.querySelector("#awatalk") as HTMLTextAreaElement;
    const awaOutputEl = document.querySelector("#awaout") as HTMLTextAreaElement;
    const runScriptBtn = document.querySelector(".run") as HTMLButtonElement;
    const stepScriptBtn = document.querySelector(".step") as HTMLButtonElement;
    const awaindexEl = document.querySelector(".awaindex") as HTMLSpanElement;
    const executionTimeEl = document.querySelector(".executionTime") as HTMLSpanElement;
    const commandsListEl = document.querySelector(".commands") as HTMLOListElement;
    const bubbleAbyssDisplayEl = document.querySelector(".bubble-abyss") as HTMLOListElement;
    
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
        awaindexEl.textContent = String(awaInterpreter.awaindex);
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
    updateBubbleAbyssDisplay(
        bubbles = awaInterpreter.getBubblesList(),
        container = bubbleAbyssDisplayEl
    ): void
    {
        const elements: HTMLElement[] = [];

        for(const bubble of bubbles)
        {
            const bubbleEl = document.createElement("li");

            if(typeof bubble === "number")
            {
                bubbleEl.textContent = String(bubble);
            }
            else
            {
                const dblBubbleEl = document.createElement("ol");
                updateBubbleAbyssDisplay(bubble, dblBubbleEl);
                bubbleEl.appendChild(dblBubbleEl);
            }

            elements.push(bubbleEl);
        }

        container.replaceChildren(...elements);
    }

    function
    preExecutionSteps(): void
    {
        if(isUsingLatestAwatalk && !awaInterpreter.hasFinished) return;
        isUsingLatestAwatalk = true;

        clearOutput();
        awaInterpreter.UseAwatalk(awatalkInput.value);
        updateCommandsList();
    }

    // EVENT LISTENERS
    runScriptBtn.addEventListener("click", async () =>
    {
        preExecutionSteps();
        await awaInterpreter.run();
        updateStats();
        updateBubbleAbyssDisplay();
    })
    
    stepScriptBtn.addEventListener("click", async () =>
    {
        preExecutionSteps();
        await awaInterpreter.step();
        updateStats();
        updateBubbleAbyssDisplay();
    })

    // Invalidate stored awatalk
    awatalkInput.addEventListener("input", () => isUsingLatestAwatalk = false);

    // Init
    clearOutput();
}

main();
