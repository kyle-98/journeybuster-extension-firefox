let fullTab;
let fullTabId;
let banList;
let banListJson;
let reportList = [];
let alarms;
chrome.runtime.onStartup.addListener(chrome.alarms.clearAll())
async function fetchalarm(){
    return await chrome.alarms.get('keepAliveAlarm')
}
fetchalarm().then((val) => alarms = val)
console.log(alarms)
if(!alarms){
startup()
}
chrome.runtime.onInstalled.addListener(() => {
    console.log("Installed")
    chrome.alarms.clearAll()
    startup()
})

chrome.alarms.onAlarm.addListener((alarm) => {
    console.log("KeepAlive triggered")
    alarms = alarm;
})

async function startup(){
    console.log("fetched")
    let response = await fetch("https://api.veljkokovacevic.com/buster/list");
    await response.text().then((result) => {fetchBanList(result)});
    chrome.alarms.create('keepAliveAlarm', {delayInMinutes: 0, periodInMinutes: 0.5})
}

function fetchBanList(res){
    console.log("res")
    console.log(res);
    banListJson = JSON.parse(res)
    console.log(banListJson);
    console.log("initialized")
    chrome.runtime.onMessage.addListener((request, sender, resp) => {
        switch(request.command){
            case "list":
                resp({banListJson, reportList});
                return true;
                break;
            case "report":
                if(reportCheck(request.user))
                {   
                    resp(reportList)
                    return true;
                }
                    console.log("reporting")
                console.log(sender)
                reportList.push(request.user)
                fetch("https://api.veljkokovacevic.com/buster/report",{
                    method: "POST",
                    body: request.user
                });
                resp(reportList)
                return true;
                break;
            default:
                resp("WTF")
                return false;
                break;
        }
    })
}

function reportCheck(name){
    let found = false;
    reportList.forEach((rep) => {
        if(name == rep) found = true;
    })
    return found;
}
