var utils = (function () {
    var parser = new UAParser();
    var browser = parser.getBrowser();
    var chineseBrowsers = ["baidu", "spark", "2345", "sogou", "360"];
    // Chinese browser useragent
    var browserUA = getUAString();
    if (isInUA("bidu") || isInUA("baidu")) {
        browser.name = "baidu";
    } else if (isInUA("2345ex")) {
        browser.name = "2345";
    } else if (isInUA("metasr")) {
        browser.name = "sogou";
    } else if (isInUA("spark")) {
        browser.name = "spark";
    }

    function isInUA(q) {
        var queryLowerCase = q.toLowerCase();
        var uaStr = browserUA.toLowerCase();
        return uaStr.indexOf(queryLowerCase) > -1;
    }

    function getBrowser() {
        return browser;
    }

    function getUAString() {
        return parser.getUA();
    }

    function getSubID() {
        return localStorage.getItem("subid");
    }

    function setSubID(subId) {
        return localStorage.setItem("subid", subId);
    }

    function isChineseBrowser() {
        console.log("browser.name " + browser.name);
        return chineseBrowsers.indexOf(browser.name) > -1;
    }

    return {
        getBrowser: getBrowser,
        getSubID: getSubID,
        setSubID: setSubID,
        isChineseBrowser: isChineseBrowser,
    };

})();