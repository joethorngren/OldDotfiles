/*
Description
1. Tree: .navi-item set page by 'page' and block by 'nav' prop and set it in URL. In body .navi-page-block show same 'block' property.
2. Tabs: .navi-tabs-labels > li choose tab by 'for' prop. Tabs with .navi-tabs listen it for 'tab' property.
3. Input checkbox 'evince' property set .enabled or .disabled for elements with same 'watch' prop. Use 'watch' for .navi-tabs-labels > li and .navi-roll
*/
//let $: any;
var $, NAVI = false, onLoadNavi = [], UPDListener = true;
var VAL, Size, BRW_langLoaded, translate, autoTranslate, extensionGetUrl, openUrlInNewTab, openUrlInCurrentTab, openUrlInBackgroundTab, onlyUnique, BRW_sendMessage, redrawElements, getSettingsBackgroundTabId, getThemesSortType, getLiveThemesSortType, getImagesSortType, updateAvailableThemesListOnPageLoad, updateAvailableThemesListFavorites, setVisibleElementsBySortType, getRandomThemesDisplay, sendToGoogleAnaliticMP, gamp;
$(function () {
    NAVI = new optionsNavi();
    var $navi = $("#tree-navi-left"), $head = $("#tree-navi-head"), $upper = $("#navi-upper-sections"), $sections = $("#navi-additional-sections");
    BRW_langLoaded(function () {
        $navi.load("../common/options/html/navi.html", function () {
            NAVI.htmlLoaded("navi");
            autoTranslate($navi);
        });
        $head.load("../common/options/html/head.html", function () {
            NAVI.htmlLoaded("head");
            autoTranslate($head);
        });
        $upper.load("../common/options/html/upper.html", function () {
            NAVI.htmlLoaded("upper");
            autoTranslate($upper);
        });
        $sections.load("../common/options/html/sections.html", function () {
            NAVI.htmlLoaded("sections");
            autoTranslate($sections);
        });
    });
});
var optionsNavi = (function () {
    function optionsNavi() {
        this.ONCE = [];
        this.WRAP = {
            $navi: $("#tree-navi-left"),
            $head: $("#tree-navi-head"),
            $body: $("#tree-navi-body")
        };
        this.state = {
            loaded: {
                head: false,
                navi: false,
                upper: false,
                sections: false
            },
            page: {
                main: String(document.location.pathname)
                    .split('/').pop()
                    .split('\\').pop()
                    .split('.').shift(),
                sub: String(document.location.hash).replace('#', '').split('?').shift(),
                tab: document.location.hash.indexOf('?tabs=') != -1 ? document.location.hash.replace('#', '').split('?tabs=').pop().split('&').shift().split(',') : []
            },
            active: {
                group: {},
                single: []
            },
            lastSort: 0
        };
        //console.debug("Navi Start", this);
        this.draw("preload");
    }
    ;
    optionsNavi.prototype.htmlLoaded = function (tmpl) {
        var prm = true;
        this.state.loaded[tmpl] = true;
        //console.debug("Navi htmlLoaded", tmpl, this.state.loaded);
        for (var k in this.state.loaded)
            if (this.state.loaded[k] === false) {
                prm = false;
                break;
            }
        if (prm) {
            this.once(["init", "onLoad"]);
        }
    };
    ;
    optionsNavi.prototype.legacy = function () {
        var ts = this;
        getRandomThemesDisplay();
        if (localStorage.getItem("background-parallax-display") == "1") {
            localStorage.setItem("background-parallax-show-settings", "1");
        }
        if (localStorage.getItem("background-parallax-show-settings") == "1") {
            ts.UI.navi.$section.filter("[nav=navi-settings-parallax]").removeClass("hide");
        }
    };
    ;
    optionsNavi.prototype.getUi = function () {
        var _this = this;
        var ts = this;
        ts.UI = {
            navi: {
                $wrap: ts.WRAP.$navi,
                $section: ts.WRAP.$navi.find(".navi-item"),
                $sort: ts.WRAP.$navi.find(".sort-navi")
            },
            body: {
                $links: ts.WRAP.$body.find("[nav]"),
                $block: ts.WRAP.$body.find(".navi-page-block"),
                $label: ts.WRAP.$body.find(".navi-tabs-labels li"),
                $tabs: ts.WRAP.$body.find(".navi-tab"),
                $memorize: ts.WRAP.$body.find("[memorize]"),
                $controls: ts.WRAP.$body.find("input, textarea, select"),
                $watchers: ts.WRAP.$body.find("[watch]"),
                $media: ts.WRAP.$body.find("#navi-theme-play"),
                $bgName: ts.WRAP.$body.find(".current-bg-name"),
                $bgAuthor: ts.WRAP.$body.find(".current-bg-author"),
                $bgType: ts.WRAP.$body.find("#bg-type-list > .sort-item"),
                $bgTypeCheck: ts.WRAP.$body.find("#bg-type-list > .sort-item .navi-label [type=checkbox]"),
                $conditions: ts.WRAP.$body.find(".navi-conditions"),
                $mark: ts.WRAP.$body.find("[mark]"),
                $installTheme: ts.WRAP.$body.find("[mark]")
            },
            active: {
                $group: ts.WRAP.$body.find("[option-group]"),
                $single: ts.WRAP.$body.find("[option-single]")
            },
            common: {
                $animate: $(".animate-waiting"),
                $links: $(".navi-link, .navi-block-link"),
                $exit: $(".navi-exit"),
                $fixed: $(".scroll-fixed")
            }
        };
        setTimeout(function () {
            ts.UI.body.$controls.addClass("animate");
            ts.UI.body.$watchers.addClass("animate");
            ts.UI.common.$animate.removeClass("animate-waiting").addClass("animate");
        }, 500);
        ts.UI.active.$group.each(function (N, el) {
            var groupName = $(el).attr("option-group");
            if (!_this.state.active.group[groupName])
                _this.state.active.group[groupName] = [];
            _this.state.active.group[groupName].push($(el).attr("id"));
        });
        //this.state.active.group = this.state.active.group.filter(onlyUnique);
        ts.UI.active.$single.each(function (N, el) {
            _this.state.active.single.push($(el).attr("option-single"));
        });
        this.state.active.single = this.state.active.single.filter(onlyUnique);
        //console.debug("Navi Start", ts);
    };
    ;
    optionsNavi.prototype.listeners = function () {
        var ts = this;
        ts.UI.navi.$section.unbind("click").on("click", function (event) {
            ts.setNavi($(event.currentTarget), { ctrlKey: event.ctrlKey, shiftKey: event.shiftKey });
        });
        ts.UI.common.$links.unbind("click").on("click", function (event) {
            var href = $(event.currentTarget).attr("href");
            if (href) {
                event.preventDefault();
                ts.openUrl(href, { ctrlKey: true, shiftKey: event.shiftKey });
            }
            else {
                //console.warn("Can't found href for", event);
            }
        });
        ts.UI.body.$links.unbind("click").on("click", function (event) {
            ts.setNavi($(event.currentTarget), { ctrlKey: event.ctrlKey, shiftKey: event.shiftKey });
        });
        ts.UI.body.$label.unbind("click").on("click", function (event) {
            ts.setTab($(event.currentTarget), { ctrlKey: event.ctrlKey, shiftKey: event.shiftKey });
        });
        this.UI.body.$controls.on("change", function (event) {
            ts.change($(event.currentTarget));
        });
        this.UI.active.$group.on("change", function (event) {
            VAL.set($(event.currentTarget), { group: $(event.currentTarget).attr("option-group") });
        });
        this.UI.active.$single.on("change", function (event) {
            VAL.set($(event.currentTarget), { name: $(event.currentTarget).attr("option-single") });
        });
        this.UI.common.$exit.on("click", function (event) {
            event.preventDefault();
            ts.openUrl(extensionGetUrl("/pages/newtab/newtab.html"), { ctrlKey: event.ctrlKey, shiftKey: event.shiftKey });
        });
        this.WRAP.$body.on("click", ".available-install-live-theme", function (event) {
            //event.preventDefault();
            ts.installLiveTheme($(event.currentTarget));
        });
        $(window).on("focus", function () {
            ts.refreshSortType();
        });
        $(document).on("scroll", function () {
            ts.draw("scroll");
        });
    };
    ;
    optionsNavi.prototype.openUrl = function (URL, Mode) {
        if (Mode === void 0) { Mode = false; }
        var ts = this;
        if (typeof Mode != "object")
            Mode = [Mode || false];
        //console.debug("NAVI.openUrl", URL, Mode);
        if (!Mode.ctrlKey && !Mode.shiftKey) {
            if (URL.indexOf(document.location.pathname) !== -1) {
                document.location.href = URL;
                ;
            }
            else {
                openUrlInCurrentTab(URL);
            }
        }
        else if (Mode.ctrlKey && !Mode.shiftKey) {
            openUrlInNewTab(URL);
        }
        else if (Mode.shiftKey) {
            openUrlInBackgroundTab(URL);
            if (URL.indexOf("/options.html") != -1) {
                setTimeout(function () {
                    //ts.setSortType();
                }, 500);
            }
        }
    };
    ;
    optionsNavi.prototype.change = function ($el, Mode) {
        if (Mode === void 0) { Mode = false; }
        if (typeof Mode != "object")
            Mode = [Mode || false];
        if ($el.attr('evince'))
            this.draw("evince", { $el: $el });
        if (!Mode.passive) {
            if ($el.attr('mirror'))
                this.draw("mirror", { $el: $el });
        }
    };
    ;
    optionsNavi.prototype.clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };
    ;
    optionsNavi.prototype.setTab = function ($el, Mode) {
        if (Mode === void 0) { Mode = false; }
        var ts = this;
        if (typeof Mode != "object")
            Mode = [Mode || false];
        if (Mode.ctrlKey || Mode.shiftKey) {
            var last_1 = ts.clone(ts.state.page);
            UPDListener = false;
            setTimeout(function () {
                ts.state.page = ts.clone(last_1);
            }, 250);
        }
        else {
            UPDListener = true;
        }
        if (!Mode.passive) {
            if ($el.hasClass("disabled"))
                return false;
            if (!$el || !$el.attr("for"))
                return;
            var tab = $el.attr("for"), $labels = $el.parents(".navi-tabs-labels");
            for (var k = ts.state.page.tab.length - 1; k >= 0; k--) {
                if ($labels.find("[for=" + ts.state.page.tab[k] + "]").length) {
                    ts.state.page.tab.splice(k, 1);
                }
            }
            ts.state.page.tab.push(tab);
            var url = String(document.location.pathname).split('/');
            url.pop();
            if ($el.parents(["memorize"]).length || $el.attr(["memorize"]))
                VAL.set($el, { group: "navi-tabs" });
            this.urlAddTabs(Mode);
        }
        if (!Mode.ctrlKey && !Mode.shiftKey) {
            ts.draw("page", { $el: $el, passive: Mode.passive || false });
        }
        return true;
    };
    ;
    optionsNavi.prototype.setNavi = function ($el, Mode) {
        if ($el === void 0) { $el = false; }
        if (Mode === void 0) { Mode = false; }
        var ts = this;
        if (typeof Mode != "object")
            Mode = [Mode || false];
        if (Mode.ctrlKey || Mode.shiftKey) {
            var last_2 = ts.clone(ts.state.page);
            UPDListener = false;
            setTimeout(function () {
                ts.state.page = ts.clone(last_2);
            }, 250);
        }
        else {
            UPDListener = true;
        }
        if (!$el) {
            if (ts.state.page.sub)
                $el = ts.UI.navi.$section.filter("[nav=" + ts.state.page.sub + "]");
            else {
                $el = ts.UI.navi.$section.filter("[page=" + ts.state.page.main + "]").filter(".selected");
                if (!$el.length) {
                    $el = ts.UI.navi.$section.filter("[page=" + ts.state.page.main + "]").filter("[default=1]");
                }
            }
        }
        var page = $el.attr("page") || "any";
        var target = {
            main: page != "any" ? page : ts.state.page.main,
            sub: $el.attr("nav")
        };
        if ($el.hasClass("passive")) {
            //target.sub = ts.UI.navi.$section.filter(`[page=${target.main}]`).filter("[default=1]").attr("nav");
            target.sub = $el.parent().find("[default=1]").attr("nav");
        }
        if (target.main != ts.state.page.main) {
            target.url = String(document.location.pathname).split('/');
            target.url.pop();
            target.url = target.url.join("/") + "/" + target.main + ".html";
            if (target.sub)
                target.url += "#" + target.sub;
            if (String(target.url).indexOf("undefined") === -1) {
                ts.openUrl(target.url, Mode);
            }
            else {
                console.warn("Wrong new tab URL", target.url);
                console.trace();
            }
        }
        else {
            VAL.set("navi-section-" + ts.state.page.main, target.sub);
            //document.location.href = target.url;
            ts.state.page.main = target.main;
            ts.state.page.sub = target.sub;
            ts.urlAddTabs(Mode);
            if (!Mode.ctrlKey && !Mode.shiftKey) {
                ts.draw("page", { $el: $el });
            }
        }
    };
    ;
    optionsNavi.prototype.urlAddTabs = function (Mode) {
        if (Mode === void 0) { Mode = false; }
        var ts = this;
        if (typeof Mode != "object")
            Mode = [Mode || false];
        var $blockTabs = ts.UI.body.$block.filter("[block=" + ts.state.page.sub + "]").find(".navi-tabs-labels > [for]");
        var targetURL = document.location.pathname;
        if (ts.state.page.sub) {
            targetURL += "#" + ts.state.page.sub;
            if ($blockTabs.length) {
                for (var i = (ts.state.page.tab.length - 1); i >= 0; i--) {
                    if ($blockTabs.filter("[for=" + ts.state.page.tab[i] + "]").length === 0) {
                        ts.state.page.tab.splice(i, 1);
                    }
                }
                if (ts.state.page.tab.length) {
                    targetURL += '?tabs=' + ts.state.page.tab.filter(onlyUnique).sort().join(',');
                }
            }
        }
        else {
        }
        if (targetURL.indexOf("undefined") === -1) {
            //document.location.href = targetURL;
            ts.openUrl(targetURL, Mode);
        }
        else {
            console.warn("Wrong URL", targetURL);
            console.trace();
        }
    };
    ;
    optionsNavi.prototype.applyVal = function ($el, val, Mode) {
        if (Mode === void 0) { Mode = false; }
        var ts = this;
        if (typeof Mode != "object")
            Mode = [Mode || false];
        //console.debug($el, val);
        if (typeof $el === "string")
            $el = ts.UI.body.$controls.filter("#" + $el.replace('#', '') + ", [name=" + $el.replace('#', '') + "]");
        if ($el.length) {
            var tag = $el.attr("type");
            if (tag == "checkbox")
                val = $el.prop("checked", val ? true : false);
            else if (tag == "radio")
                val = $el.filter("[value=" + val + "]").prop("checked", true);
            else if (tag == "select")
                val = $el.val(val);
            else
                val = $el.val(val);
            ts.change($el, Mode);
        }
        else {
            //console.warn("Lost $el for applyVal", $el, val);
        }
    };
    ;
    optionsNavi.prototype.draw = function (Actions, Mode) {
        if (Mode === void 0) { Mode = false; }
        var ts = this;
        if (typeof Actions != "object")
            Actions = [Actions || false];
        if (typeof Mode != "object")
            Mode = [Mode || false];
        var _loop_1 = function (action) {
            //console.debug("Draw", action);
            switch (action) {
                case "init":
                    for (var groupName in ts.state.active.group) {
                        ts.draw("group", { name: groupName });
                    }
                    for (var _i = 0, _a = ts.state.active.single; _i < _a.length; _i++) {
                        var singleName = _a[_i];
                        ts.draw("single", { name: singleName });
                    }
                    if (ts.state.page.main == "options") {
                        var Tabs = VAL.get("navi-tabs", true);
                        for (var tab in Tabs) {
                            var $tab = ts.UI.body.$memorize.filter("[memorize=" + tab + "]").find("[for=" + Tabs[tab] + "]");
                            if ($tab.length)
                                ts.setTab($tab, { passive: true });
                        }
                        ts.reloadTheme();
                    }
                    if (true) {
                        var Names_1 = [], Navs_1 = {};
                        ts.UI.navi.$sort.each(function (N, item) {
                            Names_1.push($(item).text());
                            Navs_1[$(item).text()] = $(item).attr("nav");
                        });
                        Names_1.sort();
                        for (var k in Names_1) {
                            ts.UI.navi.$sort.filter("[nav=" + Navs_1[Names_1[k]] + "]").css("order", k);
                        }
                    }
                    setTimeout(function () {
                        ts.draw("fixed");
                    }, 100);
                    break;
                case "scroll":
                    var scroll_1 = $(document).scrollTop();
                    console.debug(scroll_1);
                    ts.UI.common.$fixed.each(function (N, item) {
                        var $fixed = $(item);
                        var activate = parseInt($fixed.attr("activate"));
                        if (activate) {
                            if (scroll_1 >= activate)
                                $fixed.addClass("fixed");
                            else
                                $fixed.removeClass("fixed");
                        }
                    });
                    break;
                case "fixed":
                    var $set = void 0;
                    if (Mode.$wrap && Mode.$wrap.length)
                        $set = Mode.$wrap.find(".scroll-fixed");
                    else
                        $set = ts.UI.common.$fixed;
                    //console.debug($set);
                    $set.each(function (N, item) {
                        var $fixed = $(item);
                        var $inner = $fixed.find(".scroll-inner");
                        var offset = $fixed.offset();
                        var width = $fixed.width();
                        var height = $fixed.height();
                        //console.debug($fixed.width(), $fixed.height());
                        //console.debug(offset.top, offset.left, offset);
                        if (width && height && !$fixed.attr("activate")) {
                            $fixed.css({
                                width: width,
                                height: height
                            })
                                .attr("activate", offset.top);
                            $inner.css({
                                left: offset.left,
                                width: width
                            });
                        }
                    });
                    break;
                case "group":
                    var vals_1 = VAL.get(Mode.name, true);
                    //console.debug(vals);
                    //console.debug(ts.UI.active.$group);
                    //console.debug( ts.UI.active.$group.filter(`[option-group='${Mode.name}']`));
                    ts.UI.active.$group.filter("[option-group='" + Mode.name + "']").each(function (N, el) {
                        var name = $(el).attr("id");
                        ts.applyVal($(el), vals_1[name]);
                    });
                    break;
                case "single":
                    var val = VAL.get(Mode.name);
                    ts.applyVal(ts.UI.active.$single.filter("[option-single='" + Mode.name + "']"), val, { passive: true });
                    break;
                case "evince":
                    var tagName = String(Mode.$el[0].tagName).toLowerCase();
                    var $watchers = $.fn.add.call(ts.UI.body.$block /*.filter(`[block=${ ts.state.page.sub || 'no-block' }]`)*/.find("[watch='" + Mode.$el.attr("evince") + "']"), ts.UI.navi.$section.filter("[watch='" + Mode.$el.attr("evince") + "']"));
                    $watchers.removeClass("disabled").removeClass("enabled");
                    if (Mode.$el.attr("type") == "checkbox") {
                        if (Mode.$el.prop("checked")) {
                            //if(Mode.$el.attr("evince") == "dials-background") console.debug($watchers.filter(".watch-invert"));
                            $watchers.filter(":not(.watch-invert)").addClass("enabled");
                            $watchers.filter(".watch-invert").addClass("disabled");
                        }
                        else {
                            $watchers.filter(":not(.watch-invert)").addClass("disabled");
                            $watchers.filter(".watch-invert").addClass("enabled");
                        }
                    }
                    else if (tagName == "select") {
                        var val_1 = Mode.$el.val();
                        $watchers.addClass("disabled");
                        $watchers.filter(".w_" + val_1).removeClass("disabled").addClass("enabled");
                    }
                    break;
                case "page":
                    ts.UI.navi.$section.removeClass("active");
                    ts.UI.body.$block.removeClass("active");
                    if (ts.state.page.sub) {
                        ts.UI.navi.$section.filter("[nav=" + ts.state.page.sub + "]").addClass("active");
                        ts.UI.body.$links.filter("[nav=" + ts.state.page.sub + "]").addClass("active");
                        var $currentBlock = ts.UI.body.$block.filter("[block=" + ts.state.page.sub + "]");
                        $currentBlock.addClass("active");
                        $currentBlock.find("[setId]").each(function (N, target) {
                            var setId = $(target).attr("setId");
                            if ($(target).attr("id") != setId) {
                                $("#" + setId).attr("id", "");
                                $(target).attr("id", setId);
                            }
                        });
                        $currentBlock.find(".navi-active-clean").each(function (N, target) {
                            var tagName = String($(target)[0].tagName).toLowerCase();
                            if (tagName == "input") {
                                $(target).val("");
                            }
                            else {
                                $(target).html("");
                            }
                        });
                        $currentBlock.find(".navi-tabs-labels").each(function (N, labels) {
                            var curTab = false;
                            var $li = $(labels).find("li");
                            for (var _i = 0, _a = ts.state.page.tab; _i < _a.length; _i++) {
                                var tab = _a[_i];
                                var $tab = $li.filter("[for=" + tab + "]");
                                if ($tab.length) {
                                    curTab = $tab.attr("for");
                                    break;
                                }
                            }
                            if (!curTab) {
                                var filter = ".active";
                                if (!$li.filter(filter).length)
                                    filter = ":eq(0)";
                                curTab = $li.filter(filter).attr("for");
                                if (ts.state.page.tab.indexOf(curTab) === -1)
                                    ts.state.page.tab.push(curTab);
                            }
                            $li.removeClass("active").filter("[for=" + curTab + "]").addClass("active");
                            var $naviBlock = $li.parents('.navi-block');
                            if (ts.state.page.main == "options") {
                                $naviBlock
                                    .attr("active", curTab)
                                    .css({
                                    "min-height": ($(window).height() - $naviBlock.offset().top - 60)
                                });
                            }
                            $naviBlock.find(".navi-tab")
                                .removeClass("active")
                                .filter("[tab=" + curTab + "]")
                                .addClass("active");
                        });
                        /*
                        setTimeout(()=>{
                            ts.draw("counters", {$wrap:$currentBlock});
                        }, 50);
                        */
                        var indent = $(window).height() - $currentBlock.offset().top - $currentBlock.height();
                        if (indent > 60)
                            ts.UI.body.$conditions.addClass('fixed');
                        else
                            ts.UI.body.$conditions.removeClass('fixed');
                        ts.draw("player");
                        ts.draw("fixed", $currentBlock);
                    }
                    if (!Mode.passive) {
                        ts.setSortType();
                        if (String(ts.state.page.sub) == "navi-bg-downloaded")
                            ts.draw("downloaded-dummy");
                    }
                    break;
                case "counters":
                    if (!Mode.$wrap)
                        Mode.$wrap = ts.UI.body.$block.filter(".active");
                    var counts_1 = {};
                    Mode.$wrap.find("[counter]").each(function (N, el) {
                        var $el = $(el);
                        var $label = $el.parents("[for]:eq(0)");
                        var label = $label.attr("for");
                        var $tab = $label.parents(".navi-block").find("[tab=" + label + "]");
                        var count = $tab.find($el.attr("counter")).length;
                        if (count === 0) {
                            $tab.addClass("hide-tiles");
                            $tab.find(".navi-null-message").addClass("active");
                            $tab.find(".navi-null-hide").addClass("hide");
                        }
                        else {
                            $tab.removeClass("hide-tiles");
                            $tab.find(".navi-null-message").removeClass("active");
                            $tab.find(".navi-null-hide").removeClass("hide");
                        }
                        //console.debug(count, $tab);
                        counts_1[label] = count;
                        $el.text(" (" + count + ")");
                    });
                    var section = String(Mode.$wrap.attr("block")).replace("navi-bg-", '');
                    if (section == "favorites" || section == "downloaded") {
                        var option = "randomize-" + section;
                        var val_2 = VAL.get(option);
                        var $controls = ts.UI.body.$controls.filter("[name=" + option + "]");
                        //console.debug(section, counts);
                        if (counts_1[section + "-static-wallpapers"] > 0) {
                            $controls.filter("[value=image]").attr("disabled", false).parent().attr("title", "");
                        }
                        else {
                            if (val_2 == "images")
                                VAL.set(option, { value: "off", apply: true });
                            $controls.filter("[value=image]").attr("disabled", "disabled")
                                .parent().attr("title", translate("navi_" + section + "_disabled").replace("[name]", translate("navi_singular_bg_static")));
                        }
                        if (counts_1[section + "-live-backgrounds"] > 0 || counts_1[section + "-live-themes"]) {
                            $controls.filter("[value=both]").attr("disabled", false).parent().attr("title", "");
                            $controls.filter("[value=video]").attr("disabled", false).parent().attr("title", "");
                        }
                        else {
                            if (val_2 == "video")
                                VAL.set(option, { value: "off", apply: true });
                            $controls.filter("[value=video]").attr("disabled", "disabled")
                                .parent().attr("title", translate("navi_" + section + "_disabled").replace("[name]", translate("navi_singular_bg_live")));
                            if (counts_1[section + "-static-wallpapers"] == 0) {
                                if (val_2 == "both")
                                    VAL.set(option, { value: "off", apply: true });
                                $controls.filter("[value=both]").attr("disabled", "disabled")
                                    .parent().attr("title", translate("navi_" + section + "_disabled").replace("[name]", translate("navi_singular_bg_any")));
                            }
                        }
                    }
                    break;
                case "downloaded-dummy":
                    var downloaded = JSON.parse(localStorage.getItem("installed-themes") || "[]");
                    var liveThemesIDs = JSON.parse(localStorage.getItem("live-themes-ids") || "[]");
                    var content = { $video: [], $image: [], $theme: [] };
                    for (var themeId in downloaded) {
                        var theme = downloaded[themeId];
                        if (!Size(theme.bgVideoPath)) {
                            content.$image.push($("<li class='dummy'>" + theme.title + "</li>"));
                        }
                        else {
                            content.$video.push($("<li class='dummy'>" + theme.title + "</li>"));
                            if (theme.chromeThemeUrl || liveThemesIDs.indexOf(theme.id) !== -1) {
                                content.$theme.push($("<li class='dummy'>" + theme.title + "</li>"));
                            }
                        }
                        //console.debug(theme);
                    }
                    ts.UI.body.$tabs.filter("[tab=downloaded-live-backgrounds]").find(".dummy-content").html(content.$video);
                    ts.UI.body.$tabs.filter("[tab=downloaded-static-wallpapers]").find(".dummy-content").html(content.$image);
                    ts.UI.body.$tabs.filter("[tab=downloaded-live-themes]").find(".dummy-content").html(content.$theme);
                    ts.draw("counters");
                    break;
                case "video":
                    if (ts.UI.body.$media.find("video").length &&
                        String(ts.UI.body.$media.find("source").attr("src")).indexOf(Mode.mediaFile) !== -1) {
                        return { value: void 0 };
                    }
                    ts.UI.body.$media
                        .removeClass("media-image")
                        .html("")
                        .append($("<video>")
                        .attr("loop", "loop")
                        .attr("muted", "muted")
                        .attr("autoplay", "autoplay")
                        .attr("src", Mode.mediaFile)
                        .append($("<source>")
                        .attr("type", "video/" + Mode.mediaFile.split('?').shift().split('.').pop())
                        .attr("src", Mode.mediaFile)));
                    ts.draw("bg-name", { fileName: String(localStorage.getItem("background-video-file")) });
                    ts.draw("player" /*, {"control" : "pause"}*/);
                    break;
                case "player":
                    var $video = ts.UI.body.$media.find("video");
                    if ($video.length) {
                        if (!Mode.control)
                            Mode.control = ts.state.page.sub == "navi-bg-active" ? "play" : "pause";
                        var video = $video[0];
                        if (Mode.control == "play") {
                            video.play();
                        }
                        else {
                            video.pause();
                        }
                    }
                    break;
                case "image":
                    if (String(ts.UI.body.$media.css("background-image")).indexOf(Mode.mediaFile) !== -1)
                        return { value: void 0 };
                    ts.UI.body.$media
                        .addClass("media-image")
                        .html("")
                        .css("background-image", "url(" + Mode.mediaFile);
                    ts.draw("bg-name", { fileName: String(localStorage.getItem("background-image-file")) });
                    break;
                case "bg-name":
                    var themes = JSON.parse(localStorage.getItem("installed-themes") || "[]");
                    for (var key in themes) {
                        if (Mode.fileName.indexOf(key) !== -1) {
                            ts.UI.body.$bgName.text(themes[key].title);
                            //console.debug(themes[key]);
                            ts.UI.body.$bgAuthor.html("");
                            if (themes[key].author_url) {
                                ts.UI.body.$bgAuthor
                                    .append($("<a>")
                                    .attr("target", "_blank")
                                    .attr("href", themes[key].author_url)
                                    .text(themes[key].author.replace('https://', '').replace('http://', '').replace('www.', '')));
                            }
                            else if (themes[key].author) {
                                ts.UI.body.$bgAuthor.text(themes[key].author.replace('https://', '').replace('http://', '').replace('www.', ''));
                            }
                            break;
                        }
                    }
                    break;
                case "mirror":
                    return "continue";
                    /*
                    setTimeout(()=>{
                        
                        this.applyVal(
                            ts.UI.body.$controls.filter(`#${Mode.$el.attr("mirror")}`)
                            ,
                            VAL.get(Mode.$el.attr("option-single"))
                        );
                        
                    }, 15);
                    */
                    break;
            }
        };
        for (var _i = 0, Actions_1 = Actions; _i < Actions_1.length; _i++) {
            var action = Actions_1[_i];
            var state_1 = _loop_1(action);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    };
    ;
    optionsNavi.prototype.refreshSortType = function () {
        var ts = this;
        var sortTime = parseInt(localStorage.getItem("navi-sort-time")) || 0;
        if (sortTime != ts.state.lastSort) {
            ts.setSortType();
        }
    };
    ;
    optionsNavi.prototype.setSortType = function ($el) {
        if ($el === void 0) { $el = false; }
        var ts = this;
        var needUpdate = false, settingsTab = false, liveBgSortType = false, imagesSortType = false, liveThemesSortType = false;
        ts.state.lastSort = Date.now();
        localStorage.setItem("navi-sort-time", ts.state.lastSort);
        //console.debug(ts.state.page.sub, ts.state.page.tab);
        // Route
        if (ts.state.page.sub === "navi-bg-favorites") {
            needUpdate = true;
            VAL.set("show-favorites", 1);
            if (needUpdate)
                updateAvailableThemesListFavorites();
        }
        else {
            VAL.set("show-favorites", 1);
            
            localStorage.setItem("flixel-themes-current-page", "0");
            
            if (ts.state.page.sub === "navi-bg-live-backgrounds") {
                settingsTab = 0;
                liveBgSortType = 2;
                if (ts.state.page.tab.indexOf("live-bg-new") !== -1)
                    liveBgSortType = 0; //2;
                else if (ts.state.page.tab.indexOf("live-bg-popular") !== -1)
                    liveBgSortType = 1; //0;
                else if (ts.state.page.tab.indexOf("live-bg-featured") !== -1)
                    liveBgSortType = 2; //2
                else if (ts.state.page.tab.indexOf("live-bg-search") !== -1)
                    liveBgSortType = 4;
                needUpdate = true;
            }
            else if (ts.state.page.sub === "navi-bg-wallpapers") {
                settingsTab = 2;
                imagesSortType = 0;
                if (ts.state.page.tab.indexOf("walpapers-gallery") !== -1)
                    imagesSortType = 0;
                else if (ts.state.page.tab.indexOf("walpapers-custom") !== -1)
                    imagesSortType = 1;
                needUpdate = true;
            }
            else if (ts.state.page.sub === "navi-bg-live-themes") {
                settingsTab = 3;
                liveThemesSortType = 0;
                if (ts.state.page.tab.indexOf("live-themes-newest") !== -1)
                    liveThemesSortType = 0;
                else if (ts.state.page.tab.indexOf("live-themes-popular") !== -1)
                    liveThemesSortType = 1;
                needUpdate = true;
            }
            if (ts.state.page.sub === "navi-bg-downloaded") {
                liveBgSortType = 3;
                imagesSortType = 0;
                liveThemesSortType = 0;
                if (ts.state.page.tab.indexOf("downloaded-live-backgrounds") !== -1) {
                    settingsTab = 0;
                }
                else if (ts.state.page.tab.indexOf("downloaded-static-wallpapers") !== -1) {
                    settingsTab = 2;
                }
                else if (ts.state.page.tab.indexOf("downloaded-live-themes") !== -1) {
                    settingsTab = 3;
                }
                needUpdate = true;
                VAL.set("show-downloaded", 1);
            }
            else {
                VAL.set("show-downloaded", 0);
            }
            //console.debug(settingsTab, liveBgSortType, imagesSortType, liveThemesSortType);
            // Apply
            if (settingsTab !== false
                &&
                    settingsTab !== getSettingsBackgroundTabId()) {
                //console.debug("Set", "changeSettingsBackgroundCurrentTab", settingsTab);
                BRW_sendMessage({
                    command: "changeSettingsBackgroundCurrentTab",
                    tabid: settingsTab,
                    noupd: ((liveBgSortType !== false && liveBgSortType !== getThemesSortType())
                        ||
                            (imagesSortType !== false && imagesSortType !== getImagesSortType())
                        ||
                            (liveThemesSortType !== false && liveThemesSortType !== getLiveThemesSortType())) ? true : false
                });
                redrawElements();
                needUpdate = false;
            }
            if (liveBgSortType !== false && liveBgSortType !== getThemesSortType()) {
                //console.debug("Set", "setThemesSortType", liveBgSortType);
                BRW_sendMessage({
                    command: "setThemesSortType",
                    val: liveBgSortType
                });
                needUpdate = false;
            }
            if (imagesSortType !== false && imagesSortType !== getImagesSortType()) {
                //console.debug("Set", "setImagesSortType", imagesSortType);
                BRW_sendMessage({
                    command: "setImagesSortType",
                    val: imagesSortType
                });
                needUpdate = false;
            }
            if (liveThemesSortType !== false && liveThemesSortType !== getLiveThemesSortType()) {
                //console.debug("Set", "setLiveThemesSortType", liveThemesSortType);
                BRW_sendMessage({
                    command: "setLiveThemesSortType",
                    val: liveThemesSortType
                });
                needUpdate = false;
            }
            if (needUpdate) {
                updateAvailableThemesListOnPageLoad();
            }
            setTimeout(function () {
                if (typeof setVisibleElementsBySortType == "function")
                    setVisibleElementsBySortType();
            }, 10);
        }
    };
    ;
    optionsNavi.prototype.markSelected = function () {
        var ts = this, filter, value;
        ts.UI.navi.$section.removeClass("selected");
        //ts.UI.body.$bgType.removeClass("selected");
        ts.UI.body.$mark.removeClass("selected");
        ts.UI.body.$bgTypeCheck.attr("disabled", false).siblings("pseudo").attr("title", "");
        if (VAL.get("randomize-favorites") !== "off") {
            filter = "navi-bg-favorites";
            value = "favorites";
        }
        else if (VAL.get("randomize-downloaded") !== "off") {
            filter = "navi-bg-downloaded";
            value = "downloaded";
        }
        else if (VAL.get("background-image-file")) {
            filter = "navi-bg-wallpapers";
            value = "wallpapers";
        }
        else if (VAL.get("background-video-file")) {
            if (VAL.get("background-video-content-type") == 4) {
                filter = "navi-bg-live-themes";
                value = "live-themes";
            }
            else {
                filter = "navi-bg-live-backgrounds";
                value = "live-backgrounds";
            }
        }
        if (filter) {
            ts.UI.navi.$section.filter("[nav=" + filter + "]").addClass("selected");
            //ts.UI.body.$bgType.filter(`[mark=${filter}]`).addClass("selected")
            ts.UI.body.$mark.filter("[mark=" + filter + "]").addClass("selected");
            var $check = ts.UI.body.$bgType.filter("[mark=" + filter + "]").find(".navi-label [type=checkbox]");
            if ($check.length) {
                if (!$check.prop("checked"))
                    ts.applyVal($check, 1);
                $check.attr("disabled", "disabled").siblings("pseudo").attr("title", translate("navi_cant_disable_active"));
            }
        }
    };
    ;
    optionsNavi.prototype.installLiveTheme = function ($button) {
        var ts = this;
        var theme, $wrap = $button.parents(".av-content-container");
        if ($wrap.length) {
            theme = $wrap.find("[data-theme]:eq(0)").attr("data-theme");
            ts.GA('webstore', theme, 1);
        }
    };
    ;
    optionsNavi.prototype.GA = function (action, label, value) {
        sendToGoogleAnaliticMP(function () {
            gamp('send', 'event', 'theme', action, label, value);
        });
    };
    ;
    optionsNavi.prototype.reloadTheme = function () {
        var ts = this;
        if (ts.state.page.main != "options") {
            console.warn("Can't reload theme for page", ts.state.page.main);
            console.trace();
            return;
        }
        BRW_sendMessage({ command: "getBackgroundImage" }, function (response) {
            //console.debug(response);
            if (typeof response == "object"
                &&
                    (response.video || response.image)) {
                if (response.video)
                    ts.draw("video", { mediaFile: response.video });
                else if (response.image)
                    ts.draw("image", { mediaFile: response.image });
                ts.markSelected();
            } //if
        });
    };
    ;
    optionsNavi.prototype.once = function (Actions) {
        var _this = this;
        if (typeof Actions != "object")
            Actions = [Actions || false];
        for (var _i = 0, Actions_2 = Actions; _i < Actions_2.length; _i++) {
            var action = Actions_2[_i];
            if (this.ONCE.indexOf(action) !== -1)
                continue;
            switch (action) {
                case "init":
                    this.getUi();
                    this.legacy();
                    this.listeners();
                    this.draw("init");
                    this.markSelected();
                    setTimeout(function () {
                        _this.setNavi();
                    }, 50);
                    break;
                case "onLoad":
                    for (var _a = 0, onLoadNavi_1 = onLoadNavi; _a < onLoadNavi_1.length; _a++) {
                        var cb = onLoadNavi_1[_a];
                        if (typeof cb == "function")
                            cb.call();
                    }
                    break;
            }
        }
    };
    ;
    return optionsNavi;
}());
