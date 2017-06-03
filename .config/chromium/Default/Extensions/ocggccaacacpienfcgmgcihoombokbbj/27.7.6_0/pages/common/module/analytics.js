function sendToGoogleAnaliticMP(callback){    
    if(callback) callback();
    return true;
}

function gamp(send, type, category, action, label, value){
    if(browserName() == "firefox") return false; // GA Disabled for FF
     
    var param = {
        "v"     : 1,
        "tid"   : "UA-67774717-12",
        "cid"   : getCidGA(),
        "sr"    : screen.width+"x"+screen.height,
        "vp"    : document.body.clientWidth+"x"+document.body.clientHeight,
        "ul"    : String(navigator.language).toLocaleLowerCase(),
        "dt"    : document.title || "Start Page",
        "an"    : "LSP " + String(browserName()).capitalizeFirstLetter(),
        //"t"     : "pageview",
        //"dp"    : "/"+String(document.location.pathname).split("/").pop().split("\\").pop().split(".").shift(),
        //"av"    : "16.1.5"
    }

    if(type == "page_load"){
        param["t" ] = "pageview";
        param["dp"] = "/"+String(document.location.pathname).split("/").pop().split("\\").pop().split(".").shift();

    }else if(type == "event"){
        param["t" ] = "event";
        param["ec"] = category;
        param["ea"] = action;

        if(label) param["el"] = label;
        if(value != undefined) param["ev"] = value;
    }//else

    //console.log("GA", param);

    if(typeof BRW_post == 'function'){
        BRW_post(
            "http://www.google-analytics.com/collect",
            param,
            function(data) {
                //ok
            }
        );
    }//if
    
    return true;
}

function getCidGA(callback){
    var cid = localStorage.getItem("ga:clientId") || localStorage.getItem("ga-unique-cid");
    
    if(!cid){
        cid = createCidGA();
        //ga(function(tracker) { var clientId = tracker.get('clientId'); console.debug(clientId)});
    }
    
    return cid;
}

function createCidGA(callback){
    var date = new Date();
    var cid = browserName(true).substr(0, 2) + "-" + date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + "-" + Math.ceil(Math.random() * 1e15)
    localStorage.setItem("ga-unique-cid", cid);
    
    BRW_sendMessage({command: "setUninstallURL"});
    
    return cid;
}