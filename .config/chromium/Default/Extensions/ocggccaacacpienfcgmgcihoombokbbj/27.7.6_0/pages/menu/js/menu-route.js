if(head.browser.name == 'ff') head.load("css/firefox.css");

var scripts = [
        "../../vendor/jquery-2.1.3.min.js",
        "../../vendor/jquery-ui/js/jquery-ui.js",
        "../../vendor/bootstrap/js/bootstrap.min.js",
        //"../../vendor/md5.js",
        "../common.js",
];

if(head.browser.name == 'ff'){
    scripts = scripts.concat([
        "./js/menu-lib-firefox.js",
    ]);
}else if(head.browser.name == 'chrome'){
    scripts = scripts.concat([
        "../../browsers/browser-chrome.js",
        "../../browsers/datebase-chrome.js",
        "../common/auth/js/auth.js",
        //"../newtab/js/pageview.js"
    ]);
}//else

//head.load(scripts);scripts = [];

scripts = scripts.concat([
        "./js/menu.js",
]);

//Add styles
scripts = scripts.concat([
    "../common/auth/style/flex.css",
    "../common/auth/style/font-awesome.min.css",
    "../common/auth/style/style.css",
]);

//Custom scrollbar
scripts = scripts.concat([
    "../../vendor/scrollbar/jquery.mCustomScrollbar.concat.min.js",
    "../../vendor/scrollbar/jquery.mCustomScrollbar.min.css",
]);

head.load(scripts);