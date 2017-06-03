var _PAGE = "newtab";

if(head.browser.name == 'ff') head.load("css/firefox.css");

var scripts = [
        "../../vendor/jquery-2.1.3.min.js",
        "../../vendor/jquery-ui/js/jquery-ui.js",
        "../../vendor/bootstrap/js/bootstrap.min.js",
        "../../vendor/parallax.min.js",
        "../../vendor/clock/js/vendor/jquery.counteverest.js",
        "../../vendor/jquery.pulse.min.js",
        "../../vendor/contextmenu/jquery.contextmenu.js",
        "../../vendor/jGrowl/jquery.jgrowl.min.js",
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
        "../../browsers/page-firefox.js",
        "../../browsers/serverdials_firefox.js",
        //"../../browsers/dials_browser.js",
        "../../browsers/dials-common.js",
    ]);
}else if(head.browser.name == 'chrome'){
    scripts = scripts.concat([
        "../../browsers/browser-chrome.js",
        "../../browsers/datebase-chrome.js",
        "../../browsers/page-chrome.js",
        "../client/show-livestartpage-message.js"
    ]);
}//else

//head.load(scripts);scripts = [];

scripts = scripts.concat([
        "../common/module/preload.js",
        "../common/module/analytics.js",
        
        "../common/auth/js/auth.js",
        "../common/pass/js/passcode.js",
        "../common/backup/js/backup.js",
        "../common/module/suggestions.js",
        "../common/welcome/welcome.js",
    
        "js/search.js",
        "js/theme.js",
        "js/page.js",
        "js/tiles.js",
        "js/popup.js",
        "js/todo.js",
        "js/clock.js",
        "js/speech.js",
        "js/weather.js",
        "js/rate.js",
        "js/bookmarks.js",
        "js/relax.js",
        "js/relax_advanced.js",
        "js/sidebar.js",
        "js/new_dial.js",
        "js/tile_context_menu.js",
        "js/group_context_menu.js",
        "js/actions.js",
        "../common/auth/js/sync.js",
        "js/modules.js",
        "js/ondialsearch.js",
    
        "../common/focus/focus.js",
    
        "css/relax.css",
        "css/search.css",
        "css/clock/clock.css",
        "../common/auth/style/sync.css",
]);

if(head.browser.name == 'chrome'){
    scripts = scripts.concat([
        "js/pageview.js"
    ]);
}

//Add styles
scripts = scripts.concat([
    "../common/auth/style/flex.css",
    "../common/auth/style/font-awesome.min.css",
    "../common/auth/style/style.css",

    "../common/backup/style/backup.css",
    "../common/focus/focus.css",
    "../common/welcome/style/welcome.css",
]);

//Custom scrollbar
scripts = scripts.concat([
        "../../vendor/scrollbar/jquery.mCustomScrollbar.concat.min.js",
        "../../vendor/scrollbar/jquery.mCustomScrollbar.min.css",
]);

head.load(scripts);