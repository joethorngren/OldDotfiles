// Standard Google Universal Analytics code
(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga'); // Note: https protocol here

let gaID = "UA-8246384-4";
if (utils.getBrowser().name === "Baidu") {
    gaID = "UA-8246384-8";
}
ga('create', gaID, 'auto');
ga('set', 'checkProtocolTask', function () {
}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200

const sampleGA = [ // 0 = never, 1 = always, others as the % for 1/X
    {category: 'general', action: 'style_load', sample: 100},
    {category: 'general', action: 'stylish_load', sample: 100},
    {category: 'installed_styles_menu', action: null, sample: 100},
    {category: 'library_menu', action: null, sample: 100},
    {category: 'manage_installed_styles', action: null, sample: 100}
];

function analyticsMainEventReport(category, action, label, value) {

    if (typeof ga !== "function")
        return;

    for (const event of sampleGA) {
        //should meet category, and action if having action, otherwise - all events.
        if (event.category == category.toLowerCase() && ((event.action && event.action == action.toLowerCase()) || !event.action)) {
            //should match the sampling rule: 1 of X.
            if (event.sample > 0 && (Math.floor(event.sample * Math.random()) + 1 ) == 1) {
                ga('send', 'event', category, action, label, value);
            }
            return; //won't call the event: not again and as a fallback, as below.
        }
    }

    //will send the event anyhow, as no sample rule was found.
    ga('send', 'event', category, action, label, value);

}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.gacategory)
        analyticsReduce(request.gacategory, request.gaaction || null, request.galabel || null, request.gavalue || null);
});

function analyticsReduce(category, action, label, value) {
    if (localStorage.hasOwnProperty("GA_send_events") && localStorage.GA_send_events) {
        analyticsMainEventReport(category, action, label, value);
    }
}

if (undefined === localStorage.GA_send_events) {
    //sampling one of 1000 users.
    if (42 === Math.floor(Math.random() * 1000)) {
        localStorage.GA_send_events = true;
        analyticsMainEventReport("General", "enabled");
    } else {
        localStorage.GA_send_events = false;
    }
}

if (localStorage.hasOwnProperty("GA_send_events") && localStorage.GA_send_events) {
    ga('send', 'pageview');
}

//it is garbage collector, remove it from the next release. cur version is 1.7.9
Object.keys(localStorage).forEach(function (l) {
    if (/^General.*/.test(l))
        delete localStorage[l];
});
