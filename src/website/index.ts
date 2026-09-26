import { AWATISM_CODE_COMMANDS, paramedAwatisms } from "../core/awaconsts.js";
import { Awarunner } from "./runner.js";

// sorta parses awatalk to find start and end positions for each valid awatoken
// written to match behavior of parseAwas()
function
getAwatalkFragments(awatalk: string): [number, number, string][]
{
    const fragmentPositions: [number, number, string][] = [],
          matchAgainst = "AWA";
    
    let token = 0,
        remainingBits = 1,
        matchIdx = 0,
        inAwaSequence = false,
        idx = 0,
        startIdx = -1,
        char: string,
        isParam = false,
        tokenString: string = "CHECKSUM";
    
    for(; idx < awatalk.length; idx++)
    {
        char = awatalk[idx].toUpperCase();
        
        if(char === " ")
        {
            matchIdx = 0;
            inAwaSequence = false;
        }

        if(char === matchAgainst[matchIdx])
        {
            if(startIdx === -1) startIdx = idx;

            if(++matchIdx > 2)
            {
                matchIdx = 1;
                token = (token << 1) | (inAwaSequence ? 1 : 0);
                inAwaSequence = true;

                if(--remainingBits <= 0)
                {
                    remainingBits = 5;

                    if(fragmentPositions.length)
                    {
                        if(isParam) {
                            tokenString = String(token);
                            isParam = false;
                        }
                        else {
                            tokenString = AWATISM_CODE_COMMANDS[token];

                            if(paramedAwatisms.get(token))
                            {
                                remainingBits = 8;
                                isParam = true;
                            }
                        }
                    }

                    fragmentPositions.push([startIdx, idx + 1, tokenString]);
                    startIdx = idx + 1;
                    token = 0;
                }
            }
        }
    }

    return fragmentPositions;
}

function
main(): void
{
    const awatalkInput = document.querySelector("#awatalk") as HTMLTextAreaElement;
    const awaOutputEl = document.querySelector("#awaout") as HTMLTextAreaElement;
    const awatalkHighlightsEl = document.querySelector(".awatalk-highlights") as HTMLDivElement;
    const runScriptBtn = document.querySelector(".run") as HTMLButtonElement;
    const stopScriptBtn = document.querySelector(".stop") as HTMLButtonElement;
    const stepScriptBtn = document.querySelector(".step") as HTMLButtonElement;
    const resetScriptBtn = document.querySelector(".reset") as HTMLButtonElement;
    const fragTokenEl = document.querySelector(".fragToken") as HTMLSpanElement;
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

    let isUsingLatestAwatalk = false,
        awatalkFragments: ReturnType<typeof getAwatalkFragments>;

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

    function
    updateAwatalkHighlights(): void
    {
        const awatalk = awatalkInput.value;
        awatalkFragments = getAwatalkFragments(awatalk);

        const nodes: Node[] = [];
        if(awatalk && awatalkFragments.length)
            for(const [start, end] of awatalkFragments)
            {
                const stringFragment = awatalk.slice(start, end);
                const fragSpan = document.createElement("span");
                fragSpan.textContent = stringFragment;
                nodes.push(fragSpan);
            }

        if(awatalkFragments[0]?.[0])
        {
            const spacerCnt = awatalkFragments[0][0];
            for(let i = 0; i < spacerCnt; i++)
            {
                nodes.unshift(document.createTextNode("\u00A0"))
            }
        }

        awatalkHighlightsEl.replaceChildren(...nodes);
    }

    let _lastFragIdx = -1;
    function
    labelFragmentToken()
    {
        if(!awatalkFragments.length) return;
        let idx = awatalkInput.selectionStart;
        if(idx === _lastFragIdx) return; // prevents rerunning same labeling code

        fragTokenEl.textContent = "N/A";

        const spaceAtStart = awatalkFragments[0][0];
        if(idx < spaceAtStart) return;
        let target = idx - spaceAtStart;
        
        for(let i = 0; i < awatalkFragments.length; i++)
        {
            const [start, end, token] = awatalkFragments[i]
            if((target -= end - start) < 0)
            {
                fragTokenEl.textContent = token;
                _lastFragIdx = idx;
                break;
            }
        }
    }

    async function
    resetRunner(): Promise<void>
    {
        await awarunner.stop();

        clearOutput();
        awarunner.UseAwatalk(awatalkInput.value);
        isUsingLatestAwatalk = true;
    }

    async function
    doExecute(isStep: boolean)
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

    // Invalidate stored awatalk
    awatalkInput.addEventListener("input", () =>
    {
        isUsingLatestAwatalk = false;
        updateAwatalkHighlights();
    });

    awatalkInput.addEventListener("click", labelFragmentToken);
    awatalkInput.addEventListener("keydown", labelFragmentToken);
    awatalkInput.addEventListener("keyup", labelFragmentToken);
    awatalkInput.addEventListener("blur", () =>
    {
        fragTokenEl.textContent = "N/A";
        _lastFragIdx = -1;
    });
    
    awarunner.watchStatsChange((changed) => {
        if(changed.awaindex || changed.executionTime) updateStats();
        if(changed.awatokens) updateCommandsList();
        if(changed.bubbles) updateBubbleAbyssDisplay();
    })

    // Init
    clearOutput();
    updateAwatalkHighlights();
}

main();
