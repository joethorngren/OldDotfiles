const BROWSER = 'firefox';
var addonDir = "resource://team-at-livestartpage-dot-com";

function extensionGetUrl(src){
    return addonDir+String("/"+src).split('//').join('/');
}

function openUrlInNewTab(url){
    CNT.newTabOpen(url, '_blank');
}

function BRW_sendMessage(data){
    //$("body").prepend("<div>").text(JSON.stringify(data));
    
    switch(data.command){
        case "addCurrentTabToDefault":
            CNT.saveTabs('cur_tab');    
        break;
            
        case "saveTabsToNewGroupBg":
            CNT.saveTabs('all_tabs', data.title, data.filter, data.tabs);
        break;
    }
}

function getTabsList(callback){
    CNT.getTabsInfo(function(Data){
        var Data = JSON.parse(Data);
        
        if(callback) callback(Data);
    });
}

function setPanelSize(width, height){
    CNT.panelResize(width, height);
}

function BRW_bgAddNewGroup(obj, par, callback){
    CNT.groupCheckName(obj.title, function(Name){
        if(callback) callback({group:{title: Name}});
    });
}

function autoTranslate($container){
    FF_whileLoaded(function(){
        $container.find("[lang]").each(function(){
            translate($(this).attr("lang"), $(this));
        });
    }, function(){
        return (typeof CNT !== "undefined") ? true : false;
    }, {name:"Wait for CNT"});

}

function getLocalStorage(name, callback){
    FF_whileLoaded(function(){
        CNT.getLocalStorage(name, function(value){
            callback(value);
        });
    }, function(){
        return (typeof CNT !== "undefined") ? true : false;
    }, {name:"Wait for CNT"});

}

function translate(phrase, $el){
    CNT.ffTranslate(phrase, function(response){
        $el.text(response);
    });
}

function authLogout(){
    CNT.authLogout();
}

function closePanel(){
    CNT.closePanel();
}

function getAuth(callback){
    FF_whileLoaded(function(){
        CNT.getAuthInfo(function(auth){
            callback(auth);
        });
    }, function(){
        return (typeof CNT !== "undefined") ? true : false;
    }, {name:"Wait for CNT"});
}

function FF_whileLoaded(execFunction, condFunction, obj){
    if(!obj) obj={}; if(!obj.trys) obj.trys=0; if(!obj.name) obj.name='UNNAMED WAIT';
    
    if (!condFunction.call()){
        obj.trys++;
        if(obj.trys < 25) setTimeout(function(){FF_whileLoaded(execFunction, condFunction, obj)}, 70);
    }else{//Use functions
        execFunction.call(); 
    }
}//function






