let resp = await browser.runtime.sendMessage({ command: "list" });
startup(resp);

async function startup(a) {
    console.log(a);
    let response = a.banListJson;

    let divet = document.querySelector("#twitnum");
    divet.innerHTML = response["list"].length;

    document.querySelector("#ver").innerHTML = browser.runtime.getManifest().version;
}