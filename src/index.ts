import { AWATISM_CODE_COMMANDS, paramedAwatisms } from "./awaconsts.js";
import { Awarunner } from "./awarunner.js";

// sorta parses awatalk to find start and end positions for each valid awatoken
// written to match behavior of parseAwas()
function getAwatalkFragmentPositions(awatalk: string): [number, number][]
{
    const fragmentPositions: [number, number][] = [],
          matchAgainst = "AWA";
    
    let token = 0,
        remainingBits = 1,
        matchIdx = 0,
        inAwaSequence = false,
        idx = 0,
        startIdx = 0,
        confirmedStart = false,
        char: string;
    
    for(; idx < awatalk.length; idx++)
    {
        char = awatalk[idx].toUpperCase();
        
        if(char === " ")
        {
            matchIdx = 0;
            inAwaSequence = false;
            if(!confirmedStart) startIdx++;
        }

        if(char !== matchAgainst[matchIdx])
        {
            matchIdx = 0;
        }
        else if(++matchIdx > 2)
        {
            matchIdx = 1;
            token = (token << 1) | (inAwaSequence ? 1 : 0);
            inAwaSequence = true;
            confirmedStart = true;

            if(--remainingBits <= 0)
            {
                fragmentPositions.push([startIdx, idx + 1]);
                startIdx = idx + 1;
                remainingBits = paramedAwatisms.get(token) ? 8 : 5;
                token = 0;
                confirmedStart = false;
            }
        }
    }

    return fragmentPositions;
}

function main(): void
{
    const awatalkInput = document.querySelector("#awatalk") as HTMLTextAreaElement;
    const awaOutputEl = document.querySelector("#awaout") as HTMLTextAreaElement;
    const awatalkHighlightsEl = document.querySelector(".awatalk-highlights") as HTMLDivElement;
    const runScriptBtn = document.querySelector(".run") as HTMLButtonElement;
    const stopScriptBtn = document.querySelector(".stop") as HTMLButtonElement;
    const stepScriptBtn = document.querySelector(".step") as HTMLButtonElement;
    const resetScriptBtn = document.querySelector(".reset") as HTMLButtonElement;
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
        awaOutputEl.scrollTop = awaOutputEl.scrollHeight;
    }

    function
    clearOutput(): void
    {
        awaOutputEl.value = "";
    }
    
    // AWAXECUTION RUNNER 
    const awarunner = new Awarunner;
    awarunner.UseInputCallback(onInput);
    awarunner.UseOutputCallback(onOutput);

    let isUsingLatestAwatalk = false;

    function updateAwatalkHighlights(): void
    {
        const awatalk = awatalkInput.value;
        const stringFragments = getAwatalkFragmentPositions(awatalk);
        const nodes: Node[] = [];

        let prevEnd = -1;
        for(const [start, end] of stringFragments)
        {
            const stringFragment = awatalk.slice(start, end);
            if(start !== 0 && prevEnd !== start)
            {
                nodes.push(document.createTextNode("\u00A0"));
            }

            const fragSpan = document.createElement("span");
            fragSpan.textContent = stringFragment;
            nodes.push(fragSpan);

            prevEnd = end;
        }

        awatalkHighlightsEl.replaceChildren(...nodes);
    }

    function
    updateStats(): void
    {
        awaindexEl.textContent = String(awarunner.awaindex);
        executionTimeEl.textContent = String(awarunner.executionTime);
    }

    function
    updateCommandsList(): void
    {
        const newCommands: HTMLLIElement[] = [],
            awatokens = awarunner.awatokens;
        for(let i = 0; i < awatokens.length; i++)
        {
            const cmdEl = document.createElement("li");
            const token = awatokens[i];
            let content = AWATISM_CODE_COMMANDS[token];

            if(paramedAwatisms.has(token)) {
                if(i >= awatokens.length - 1) content += " ?";
                else content += " " + awatokens[++i];
                cmdEl.classList.add("paramed");
            }

            cmdEl.textContent = content;
            newCommands.push(cmdEl);
        }

        commandsListEl.replaceChildren(...newCommands);
    }

    function
    updateBubbleAbyssDisplay(
        bubbles = awarunner.bubbles,
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

    async function resetRunner(): Promise<void>
    {
        await awarunner.stop();

        clearOutput();
        awarunner.UseAwatalk(awatalkInput.value);
        isUsingLatestAwatalk = true;
    }

    async function doExecute(isStep: boolean)
    {
        const performReset = !isUsingLatestAwatalk || awarunner.hasFinished;

        if(performReset) await resetRunner();

        if(!performReset || !isStep)
        {
            if(isStep) awarunner.step();
            else awarunner.run();
        }
    }

    // EVENT LISTENERS
    runScriptBtn.addEventListener("click", doExecute.bind(null, false));
    stepScriptBtn.addEventListener("click", doExecute.bind(null, true));
    stopScriptBtn.addEventListener("click", awarunner.stop.bind(awarunner));
    resetScriptBtn.addEventListener("click", resetRunner);
    
    awarunner.watchStatsChange((changed) => {
        if(changed.awaindex || changed.executionTime) updateStats();
        if(changed.awatokens) updateCommandsList();
        if(changed.bubbles) updateBubbleAbyssDisplay();
    })

    // Invalidate stored awatalk
    awatalkInput.addEventListener("input", () =>
    {
        isUsingLatestAwatalk = false;
        updateAwatalkHighlights();
    });

    // Init
    clearOutput();
    updateAwatalkHighlights();
}

main();
