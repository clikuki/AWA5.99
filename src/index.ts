const awascriptInput = document.getElementById("awascript") as HTMLTextAreaElement;
const awascriptOutput = document.getElementById("awaout") as HTMLParagraphElement;
const runScriptBtn = document.getElementById("run") as HTMLButtonElement;

function
getInput(type: "NUMBER" | "STRING"): Promise<string>
{
    return new Promise<string>((res) =>
    {
        // yeah prompt is blocking, but just following style here
        res(prompt(`SUPPLY ${type} AS INPUT`) ?? "");
    })
}

function
onOutput(newAwaOutput: string): void
{
    awascriptOutput.textContent += newAwaOutput;
}

runScriptBtn.addEventListener("click", () =>
{
    awascriptOutput.textContent = "";

    const awascript = awascriptInput.value;
    const awaBools = parseAwas(awascript);
    const awaTokens = tokenizeAwas(awaBools, false);
    executeAwas(awaTokens, getInput, onOutput);
    debugBubblesPrint();
})

function debugBubblesPrint(): void
{
    type NestedNumberArray = (NestedNumberArray | number)[];

    function getValues(bubble: Bubble | null): NestedNumberArray
    {
        if(!bubble) return []
        if(bubble.type === "SIMPLE") return [bubble.value, ...getValues(bubble.next)];
        return [getValues(bubble.contents), ...getValues(bubble.next)];
    }

    console.log(getValues(BubbleAbyss.root));
}
