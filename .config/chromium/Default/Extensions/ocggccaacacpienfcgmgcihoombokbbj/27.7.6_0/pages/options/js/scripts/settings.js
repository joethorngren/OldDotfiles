var _PAGE = "settings";

if(head.browser.name == 'ff') head.load("css/firefox.css");

var scripts = [
        "../../vendor/jquery-2.1.3.min.js",
        "../../vendor/jquery-ui/js/jquery-ui.js",
        "../../vendor/bootstrap/js/bootstrap.min.js",
        "../../vendor/jGrowl/jquery.jgrowl.min.js",
        "../../vendor/colorpick/js/colpick.js",
        "../../vendor/md5.js",
        "../common.js",
];

if(head.browser.name == 'ff'){
    scripts = scripts.concat([
        "../../vendor/q.js",
        "../../vendor/dexie.min.js",
        "../../vendor/LargeLocalStorage.min.js",
        "../../browsers/browser-firefox.js",
        "../../browsers/datebase-firefox.js",
        "../backend/theme.js",
        "../backend/groups.js",
        "../backend/dials.js",
        //"../backend/backend.js",
        "../backend/backend-common.js",
        "../backend/install.js",
        "../../browsers/page-firefox.js"
    ]);
}else if(head.browser.name == 'chrome'){
    scripts = scripts.concat([
        "../../browsers/browser-chrome.js",
        "../../browsers/datebase-chrome.js",
        "../../browsers/page-chrome.js",
        "../client/show-livestartpage-message.js"
    ]);
}//else

scripts = scripts.concat([
        "../common/module/analytics.js",
    
        "../common/options/js/value.js",
        "../common/options/js/navi.js",
        "../common/options/css/navi.css",
    
        "../common/auth/js/auth.js",
        "../common/pass/js/passcode.js",
        "../common/backup/js/backup.js",
        "../common/module/suggestions.js",
        "../common/module/preload.js",
    
        "js/content/header.js",
        "js/content/rating.js",
        "js/content/feedback.js",
        "js/content/weather.js",
        "js/common.js",
        "js/settings.js",
        "../../vendor/share42/share42.js",    
        //"../../vendor/widgets.js",    
    
        "../common/focus/focus.js",
        "../common/auth/js/sync.js",
        "../common/module/subscribe.js",
        "../common/module/css/subscribe.css",
]);

//Add styles
scripts = scripts.concat([
    "../common/auth/style/sync.css",
    "/pages/newtab/css/popup.css",
    "../common/auth/style/flex.css",
    "../common/auth/style/font-awesome.min.css",
    "../common/auth/style/style.css",
    
    "../common/backup/style/backup.css",
    "../common/focus/focus.css",
]);

head.load(scripts);