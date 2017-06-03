$(function(){
    localStorage.clear();
    
    var appDB = new Dexie('speeddial');
    appDB.delete();
    
    //window.location.href="./backend-firefox.html";
    //window.location.href="../options/options.html";
    
    FF_whileLoaded(function () {
        setTimeout(function(){
            BRW_openPageAfterAppInstall();
        }, 500);
    }, function () {
        return (typeof CNT !== "undefined") ? true : false;
    }, {
        name: "Wait for CNT"
    });
    
});