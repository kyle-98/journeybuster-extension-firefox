console.log("Journey-Buster Injected")
let flairCss = "font-size: 10pt;border-radius: 100px;margin: 2px; padding: 0px 10px 0 10px;background-color: #CC3333; color: white;"
let oldHref = document.location.href
let aiUserFlair = document.createElement("span");
aiUserFlair.style = flairCss;
aiUserFlair.innerHTML = "AI USER";

let reportButton = document.createElement("button");
reportButton.style = "cursor: pointer;font-weight: bold;font-family: TwitterChirp; margin: 10px 0px 5px 0px;padding: 5px 10px 5px 10px;border-radius: 2px;width: 140px; background-color: #c96f32; border: none;"
reportButton.innerHTML = "Report AI Content"
reportButton.className = "jb_RepBtn"
let reportedBool = false;

let aiUserProfileFlair = document.createElement("div");
aiUserProfileFlair.style = "font-family: TwitterChirp;border-radius: 2px;padding: 10px;margin-top: 3px;background-color:#331111;text-overflow: unset;"
aiUserProfileFlair.innerHTML = "<div style='font-weight: bold;'>AI User</div><br/><div>This Twitter Account has been flagged for using, generating or advertising images generated with Artificial Intelligence, and passing it off as original content. </div><span style='font-size:8pt; font-family: TwitterChirp; color:#AA4545'>Journey-Buster</span>";
aiUserProfileFlair.className = "jb_aiProfileFlair"

let repList;
let eventAttached = false;
let eventCodeA = 0;
let eventCodeB = 0;
let bLJson;
let bL;
let buttoncounter = 0;


let flairobs = new MutationObserver((mutations) =>{
    mutations.forEach((mut) => {
        console.log(mut)
    })
})

window.onload = async function(){

    console.log(self.crypto.randomUUID())
    if(window.localStorage.getItem("jb_OM")) {}
    else window.localStorage.setItem("jb_OM", 0)

    if(window.localStorage.getItem("jb_BL")) {}
    else window.localStorage.setItem("jb_BL", "")

    if(window.localStorage.getItem("jb_BLVER")) {}
    else window.localStorage.setItem("jb_BLVER", 0)


    if(window.localStorage.getItem("jb_OM") == "0"){
        chrome.runtime.sendMessage({command: "list"}, (response) => {
            bLJson = response.banListJson;
            bL = bLJson.list;
            repList = response.reportList;
            if(window.localStorage.getItem("jb_BLVER")){
                if(window.localStorage.getItem("jb_BLVER") <= bLJson["version"]){
                    window.localStorage.setItem("jb_BL", bL)
                    window.localStorage.setItem("jb_BLVER", bLJson["version"])
                }
            } else {
                window.localStorage.setItem("jb_BL", bL)
                window.localStorage.setItem("jb_BLVER", bLJson["version"])
            }
        })
    } else {
        bL = window.localStorage.getItem("jb_BL").split(',')
        
    }


    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mut) => {

            if(document.querySelector("[data-testid='UserName']")){
                if(listCheck(document.location.pathname.slice(1))){
                    console.log("Profile is AI Match")
                    if(!document.querySelector(".jb_aiProfileFlair")){
                        document.querySelector("[data-testid='UserName']").append(aiUserProfileFlair);
                        console.log("No AI Flair Found, Appending...")
                    }
                    if(document.querySelector(".jb_RepBtn")){
                        reportButton.removeEventListener("click", reportProcedure, false)
                        document.querySelector(".jb_RepBtn").remove()
                        console.log("Found Report Button, Removing")
                    }
                }
                else 
                {
                    console.log("Profile is not AI Match")
                    if(document.querySelector(".jb_aiProfileFlair")){
                        document.querySelector(".jb_aiProfileFlair").remove()
                        console.log("Found AI Flair, Removing...")
                    }

                    if(!document.querySelector(".jb_RepBtn")){
                        document.querySelector("[data-testid='UserName']").append(reportButton);
                        reportButton.removeEventListener("click", reportProcedure, false)
                        reportButton.addEventListener("click", reportProcedure, false)
            
                        console.log("No Report Button Found, Appending...")
                    } 
                    else 
                    {
                        console.log("Checking if reported already")
                        if(reportCheck(document.location.pathname.slice(1))){
                            console.log("Report Found.")
                            if(reportButton.style.backgroundColor != "green"){
                                console.log("Setting green")
                                reportButton.style.backgroundColor = "green"
                                reportButton.innerHTML = "Sent For Review"
                                reportButton.style.cursor = ""
                                reportButton.removeEventListener("click", reportProcedure, false)
                            }
                            
                        } else {
                            console.log("Report not found.")
                            if(reportButton.style.backgroundColor == "green")
                            {
                                reportButton.style.backgroundColor = "#c96f32"
                                reportButton.innerHTML = "Report AI Content"
                                reportButton.style.cursor = "pointer"
                                reportButton.removeEventListener("click", reportProcedure, false)
                                reportButton.addEventListener("click", reportProcedure, false)
                            }
                        }
                    }
                }
            }
            
            /*if(mut.addedNodes[0].nodeType == 3){
                if(mut.addedNodes[0].querySelector("[data-testid='UserName']")){
                    console.log(mut.addedNodes[0])
                }
            }*/

            
            if(mut.addedNodes.length != 0 && mut.addedNodes[0].nodeType == 1){
                
            /*
                if(mut.addedNodes[0].querySelector("[data-testid='UserName']")){
                    if(listCheck(document.location.pathname.slice(1))){
                        mut.addedNodes[0].querySelector("[data-testid='UserName']").append(aiUserProfileFlair);
                    } else {
                        mut.addedNodes[0].querySelector("[data-testid='UserName']").append(reportButton);

                        if(reportCheck(document.location.pathname.slice(1))){
                            reportButton.innerHTML = "Sent For Review"
                            reportButton.style.backgroundColor = "green"
                            reportButton.style.cursor = ""
                        } else {
                            reportButton.addEventListener("click", reportProcedure, false)
                        }
                        
                    }
                }
            */
                if(mut.addedNodes[0].getAttribute("data-testid") == "cellInnerDiv"){
                    if(mut.addedNodes[0].querySelector("[data-testid='User-Name']")){
                        let uName = mut.addedNodes[0].querySelector("[data-testid='User-Name']").querySelectorAll("a")[1].querySelector("span")
                        if(listCheck(uName.innerHTML.slice(1))){
                            uName.innerHTML = uName.innerHTML + aiUserFlair.outerHTML;
                            uName.closest("[data-testid='cellInnerDiv']").style.backgroundColor = "#221111"
                        }
                    }
                }
            }
        })
    })
    observer.observe(document.body, { childList: true, subtree: true });
}

async function reportProcedure(event){
    
    if(!reportCheck(document.location.pathname.slice(1))){
        chrome.runtime.sendMessage(chrome.runtime.id, {command: "report", user: document.location.pathname.slice(1)}, (response) =>{
            repList = response;
            reportButton.innerHTML = "Sent For Review"
            reportButton.style.backgroundColor = "green"
            reportButton.style.cursor = ""
            reportButton.removeEventListener("click", reportProcedure, false)
        })
        

    }
    else{
        alert("User already reported.")
    }
    
}

function listCheck(name){
    let found = false;
    bL.forEach((banned) => {
        if(name == banned) found = true
    })
    return found;
}

function reportCheck(name){
    let found = false;
    repList.forEach((rep) => {
        if(name == rep) found = true;
    })
    return found;
}

