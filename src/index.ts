const awaInput = document.getElementById("awascript") as HTMLTextAreaElement;
const awaOutput = document.getElementById("awaout") as HTMLParagraphElement;
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
onOutput(out: string): void
{
    awascriptOutput.textContent += out;
}

runScriptBtn.addEventListener("click", () =>
{
    awascriptOutput.textContent = "";

    const awatalk = awascriptInput.value;
    const awabits = parseAwas(awatalk);
    const awatokens = tokenizeAwas(awabits, false);
    executeAwas(awatokens, getInput, onOutput);
    debugBubblesPrint();
})

function debugBubblesPrint(): void
{   
    type NestedNumberArray = (NestedNumberArray | number)[];

    function getValues(bubble: Bubble | null): NestedNumberArray
    {
        if(!bubble) return []
        if(bubble.type === "SIMPLE") return [...getValues(bubble.prev), bubble.value];
        return [...getValues(bubble.prev), getValues(bubble.contents)];
    }

    console.log(getValues(BubbleAbyss.top));
}
