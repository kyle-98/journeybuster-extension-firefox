
await chrome.runtime.sendMessage(chrome.runtime.id, {command: "list"},(resp) => startup(resp))

async function startup(a){
    console.log(a);
    let response = a.banListJson;
    let divet = document.querySelector("#twitnum")
    divet.innerHTML = response["list"].length;
    document.querySelector("#ver").innerHTML = chrome.runtime.getManifest()["version"]
}