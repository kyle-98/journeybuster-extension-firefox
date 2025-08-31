let fullTab;
let fullTabId;
let banList;
let banListJson;
let reportList = [];
let alarms;

browser.runtime.onStartup.addListener(() => browser.alarms.clearAll());

async function fetchalarm() {
    return await browser.alarms.get('keepAliveAlarm');
}

fetchalarm().then((val) => alarms = val);
console.log(alarms);

if (!alarms) {
    startup();
}

browser.runtime.onInstalled.addListener(() => {
    console.log("Installed");
    browser.alarms.clearAll();
    startup();
});

browser.alarms.onAlarm.addListener((alarm) => {
    console.log("KeepAlive triggered");
    alarms = alarm;
});

async function startup() {
    console.log("fetched");
    let response = await fetch("https://api.veljkokovacevic.com/buster/list");
    await response.text().then((result) => { fetchBanList(result) });
    browser.alarms.create('keepAliveAlarm', { delayInMinutes: 0, periodInMinutes: 0.5 });
}

function fetchBanList(res) {
    console.log("res");
    console.log(res);
    banListJson = JSON.parse(res);
    console.log(banListJson);
    console.log("initialized");

    browser.runtime.onMessage.addListener((request, sender) => {
        return new Promise((resolve) => {
            switch (request.command) {
                case "list":
                    resolve({ banListJson, reportList });
                    break;
                case "report":
                    if (reportCheck(request.user)) {
                        resolve(reportList);
                        break;
                    }
                    console.log("reporting");
                    console.log(sender);
                    reportList.push(request.user);
                    fetch("https://api.veljkokovacevic.com/buster/report", {
                        method: "POST",
                        body: request.user
                    });
                    resolve(reportList);
                    break;
                default:
                    resolve("WTF");
                    break;
            }
        });
    });
}

function reportCheck(name) {
    let found = false;
    reportList.forEach((rep) => {
        if (name === rep) found = true;
    });
    return found;
}
