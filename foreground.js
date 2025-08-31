console.log("Journey-Buster Injected");

const aiUserFlair = document.createElement("span");
aiUserFlair.style.cssText = "font-size:10pt;border-radius:100px;margin:2px;padding:0 10px;background-color:#CC3333;color:white;";
aiUserFlair.className = "jb_AIFlair";
aiUserFlair.textContent = "AI USER";

const reportButton = document.createElement("button");
reportButton.style.cssText =
  "cursor:pointer;font-weight:bold;font-family:TwitterChirp;margin:10px 0 5px 0;padding:5px 10px;border-radius:2px;width:140px;background-color:#c96f32;border:none;";
reportButton.className = "jb_RepBtn";
reportButton.textContent = "Report AI Content";

const aiUserProfileFlair = document.createElement("div");
aiUserProfileFlair.style.cssText =
  "font-family:TwitterChirp;border-radius:2px;padding:10px;margin-top:3px;background-color:#331111;text-overflow:unset;";
aiUserProfileFlair.className = "jb_aiProfileFlair";
aiUserProfileFlair.innerHTML = `
  <div style="font-weight:bold;">AI User</div>
  <br/>
  <div>This Twitter Account has been flagged for using, generating or advertising images generated with Artificial Intelligence, and passing it off as original content.</div>
  <span style="font-size:8pt;font-family:TwitterChirp;color:#AA4545">Journey-Buster</span>
`;

let repList = [];
let bLJson = {};
let bL = [];

function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const elNow = document.querySelector(selector);
      if (elNow) {
        observer.disconnect();
        resolve(elNow);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    if (timeout) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error("Element not found: " + selector));
      }, timeout);
    }
  });
}

async function loadBanList() {
  try {
    const response = await browser.runtime.sendMessage({ command: "list" });
    bLJson = response.banListJson;
    bL = bLJson.list;
    repList = response.reportList || [];
  } catch (e) {
    console.error("Failed to load ban list:", e);
  }
}

function listCheck(name) {
  return bL.includes(name);
}

function reportCheck(name) {
  return repList.includes(name);
}

async function reportProcedure() {
  const username = window.location.pathname.slice(1);
  if (!reportCheck(username)) {
    const response = await browser.runtime.sendMessage({ command: "report", user: username });
    repList = response;
    reportButton.textContent = "Sent For Review";
    reportButton.style.backgroundColor = "green";
    reportButton.style.cursor = "default";
    reportButton.removeEventListener("click", reportProcedure);
  } else {
    alert("User already reported.");
  }
}

async function initProfileUI() {
  try {
    const profileNameEl = await waitForElement("[data-testid='UserName']");
    const username = window.location.pathname.slice(1);

    if (listCheck(username)) {
      if (!document.querySelector(".jb_aiProfileFlair")) {
        profileNameEl.appendChild(aiUserProfileFlair);
      }
      const btn = document.querySelector(".jb_RepBtn");
      if (btn) btn.remove();
    } else {
      const flair = document.querySelector(".jb_aiProfileFlair");
      if (flair) flair.remove();

      if (!document.querySelector(".jb_RepBtn")) {
        profileNameEl.appendChild(reportButton);
        reportButton.removeEventListener("click", reportProcedure);
        reportButton.addEventListener("click", reportProcedure);
        if (reportCheck(username)) {
          reportButton.textContent = "Sent For Review";
          reportButton.style.backgroundColor = "green";
          reportButton.style.cursor = "default";
        } else {
          reportButton.textContent = "Report AI Content";
          reportButton.style.backgroundColor = "#c96f32";
          reportButton.style.cursor = "pointer";
        }
      }
    }
  } catch (e) {
    console.warn("Profile UI not loaded yet:", e);
  }
}

const timelineObserver = new MutationObserver((mutations) => {
    mutations.forEach((mut) => {
        mut.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return; 

            const userSpans = node.querySelectorAll("[data-testid='User-Name'] span");
            userSpans.forEach((userSpan) => {
                const username = userSpan.textContent.slice(1);
                if (listCheck(username)) {
                    if (!userSpan.querySelector(".jb_AIFlair")) {
                        userSpan.innerHTML += aiUserFlair.outerHTML;

                        const cellDiv = userSpan.closest("[data-testid='cellInnerDiv']");
                        if (cellDiv) cellDiv.style.backgroundColor = "#221111";
                    }
                }
            });
        });
    });
});


let oldHref = location.href;
const urlObserver = new MutationObserver(() => {
  if (oldHref !== location.href) {
    oldHref = location.href;
    initProfileUI();
  }
});

(async function init() {
  await loadBanList();
  await initProfileUI();
  timelineObserver.observe(document.body, { childList: true, subtree: true });
  urlObserver.observe(document.body, { childList: true, subtree: true });
})();
