var $, VAL, NAVI;
var optionsValues = (function () {
    function optionsValues() {
        this.ONCE = [];
        this.DEFS = {
            "navi-show": '{"show-favorites":1,"show-downloaded":1,"show-wallpapers":1,"show-live-themes":1,"show-live-backgrounds":1}',
            "randomize-favorites": 'off',
            "randomize-downloaded": 'off',
            "navi-tabs": '{}'
        };
        this.state = {
            rels: {
                lastTime: 0
            }
        };
        this.state.init = true;
    }
    ;
    optionsValues.prototype.set = function ($el, data) {
        var val, name;
        if (typeof data !== "object")
            data = { value: data || false };
        if (typeof $el === "object") {
            val = this.val($el);
            name = data.name || $el.attr("id") || $el.attr("memorize") || $el.parents("[memorize]").attr("memorize");
        }
        else {
            val = data.value;
            name = $el;
        }
        var current = this.get((data.group ? data.group : name), (data.group ? true : false));
        if (data.group) {
            current[name] = val;
            current = JSON.stringify(current);
        }
        else {
            current = String(val);
        }
        localStorage.setItem((data.group ? data.group : name), current);
        //console.debug("setOption", name, current);
        if (data.apply && NAVI) {
            NAVI.applyVal(name, data.value, { passive: true });
        }
        if (!data.nogo) {
            this.relations(name, val);
        }
    };
    ;
    optionsValues.prototype.get = function (name, isGroup) {
        if (isGroup === void 0) { isGroup = false; }
        var val = localStorage.getItem(name) || this.DEFS[name] || false;
        if (isGroup)
            val = JSON.parse(val || "{}");
        if (String(val) === String(parseInt(val)))
            val = parseInt(val);
        return val;
    };
    ;
    optionsValues.prototype.relations = function (name, value) {
        var ts = this;
        if (['randomize-downloaded', 'randomize-favorites'].indexOf(name) !== -1) {
            if (NAVI)
                NAVI.markSelected();
            ts.GA(name, value, 1);
        }
        else if (value == 'off') {
            console.debug("relations exit", name, value);
            return false;
        }
        var timeout = 1;
        var Now = Date.now();
        if (Now - ts.state.rels.lastTime < 1000)
            timeout = 500;
        ts.state.rels.lastTime = Now;
        setTimeout(function () {
            if (String(name).indexOf('randomize-downloaded') === 0) {
                if (value != 'off')
                    ts.set('randomize-favorites', { value: 'off', apply: true, nogo: true });
            }
            else if (String(name).indexOf('randomize-favorites') === 0) {
                if (value != 'off')
                    ts.set('randomize-downloaded', { value: 'off', apply: true, nogo: true });
            }
            if (NAVI)
                NAVI.markSelected();
        }, timeout);
        return true;
    };
    ;
    optionsValues.prototype.val = function ($el) {
        var val = false;
        var tag = $el.attr("type") || $el[0].tagName.toLowerCase();
        if (tag == "checkbox")
            val = $el.prop("checked");
        else if (tag == "radio")
            val = $el.val();
        else if (tag == "select")
            val = $el.val();
        else if ($el.attr("for"))
            val = $el.attr("for");
        else
            val = $el.val();
        return this.boolToNum(val);
    };
    ;
    optionsValues.prototype.boolToNum = function (val) {
        if (val === true || val === "true" || val === "1")
            val = 1;
        else if (typeof val === "undefined" || val === "undefined" || val === null || val === false || val === "false" || val === "0")
            val = 0;
        else if (String(val) === String(parseInt(val)))
            val = parseInt(val);
        return val;
    };
    ;
    optionsValues.prototype.GA = function (action, label, value) {
        sendToGoogleAnaliticMP(function () {
            gamp('send', 'event', 'settings', action, label, value);
        });
    };
    ;
    return optionsValues;
}());
VAL = new optionsValues();
