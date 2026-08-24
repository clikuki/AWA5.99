const awascriptInput = document.getElementById("awascript") as HTMLTextAreaElement;
const awascriptOutput = document.getElementById("awaout") as HTMLParagraphElement;
const runScriptBtn = document.getElementById("run") as HTMLButtonElement;

runScriptBtn.addEventListener("click", () =>
{
    const awascript = awascriptInput.value;
    const awaBools = parseAwas(awascript);
    const awaTokens = tokenizeAwas(awaBools);

    console.log(awaTokens);
})
