// Generated by CoffeeScript 1.11.0
(function() {
  var Settings, root,
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  Settings = {
    debug: false,
    storage: chrome.storage.sync,
    cache: {},
    isLoaded: false,
    onLoadedCallbacks: [],
    init: function() {
      if (Utils.isExtensionPage() && Utils.isExtensionPage(window.top)) {
        this.cache = Utils.isBackgroundPage() ? localStorage : extend({}, localStorage);
        this.runOnLoadedCallbacks();
      }
      return chrome.storage.local.get(null, (function(_this) {
        return function(localItems) {
          if (chrome.runtime.lastError) {
            localItems = {};
          }
          return _this.storage.get(null, function(syncedItems) {
            var key, ref, value;
            if (!chrome.runtime.lastError) {
              ref = extend(localItems, syncedItems);
              for (key in ref) {
                if (!hasProp.call(ref, key)) continue;
                value = ref[key];
                _this.handleUpdateFromChromeStorage(key, value);
              }
            }
            chrome.storage.onChanged.addListener(function(changes, area) {
              if (area === "sync") {
                return _this.propagateChangesFromChromeStorage(changes);
              }
            });
            return _this.runOnLoadedCallbacks();
          });
        };
      })(this));
    },
    runOnLoadedCallbacks: function() {
      var results;
      this.log("runOnLoadedCallbacks: " + this.onLoadedCallbacks.length + " callback(s)");
      this.isLoaded = true;
      results = [];
      while (0 < this.onLoadedCallbacks.length) {
        results.push(this.onLoadedCallbacks.pop()());
      }
      return results;
    },
    onLoaded: function(callback) {
      if (this.isLoaded) {
        return callback();
      } else {
        return this.onLoadedCallbacks.push(callback);
      }
    },
    shouldSyncKey: function(key) {
      return (key in this.defaults) && (key !== "settingsVersion" && key !== "previousVersion");
    },
    propagateChangesFromChromeStorage: function(changes) {
      var change, key, results;
      results = [];
      for (key in changes) {
        if (!hasProp.call(changes, key)) continue;
        change = changes[key];
        results.push(this.handleUpdateFromChromeStorage(key, change != null ? change.newValue : void 0));
      }
      return results;
    },
    handleUpdateFromChromeStorage: function(key, value) {
      this.log("handleUpdateFromChromeStorage: " + key);
      if (this.shouldSyncKey(key)) {
        if (!(value && key in this.cache && this.cache[key] === value)) {
          if (value == null) {
            value = JSON.stringify(this.defaults[key]);
          }
          return this.set(key, JSON.parse(value), false);
        }
      }
    },
    get: function(key) {
      if (!this.isLoaded) {
        console.log("WARNING: Settings have not loaded yet; using the default value for " + key + ".");
      }
      if (key in this.cache && (this.cache[key] != null)) {
        return JSON.parse(this.cache[key]);
      } else {
        return this.defaults[key];
      }
    },
    set: function(key, value, shouldSetInSyncedStorage) {
      var setting;
      if (shouldSetInSyncedStorage == null) {
        shouldSetInSyncedStorage = true;
      }
      this.cache[key] = JSON.stringify(value);
      this.log("set: " + key + " (length=" + this.cache[key].length + ", shouldSetInSyncedStorage=" + shouldSetInSyncedStorage + ")");
      if (this.shouldSyncKey(key)) {
        if (shouldSetInSyncedStorage) {
          setting = {};
          setting[key] = this.cache[key];
          this.log("   chrome.storage.sync.set(" + key + ")");
          this.storage.set(setting);
        }
        if (Utils.isBackgroundPage()) {
          this.log("   chrome.storage.local.remove(" + key + ")");
          chrome.storage.local.remove(key);
        }
      }
      return this.performPostUpdateHook(key, value);
    },
    clear: function(key) {
      this.log("clear: " + key);
      return this.set(key, this.defaults[key]);
    },
    has: function(key) {
      return key in this.cache;
    },
    use: function(key, callback) {
      this.log("use: " + key + " (isLoaded=" + this.isLoaded + ")");
      return this.onLoaded((function(_this) {
        return function() {
          return callback(_this.get(key));
        };
      })(this));
    },
    postUpdateHooks: {},
    performPostUpdateHook: function(key, value) {
      var base;
      return typeof (base = this.postUpdateHooks)[key] === "function" ? base[key](value) : void 0;
    },
    nuke: function(key) {
      delete localStorage[key];
      chrome.storage.local.remove(key);
      return chrome.storage.sync.remove(key);
    },
    log: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (this.debug) {
        return console.log.apply(console, ["settings:"].concat(slice.call(args)));
      }
    },
    defaults: {
      scrollStepSize: 60,
      smoothScroll: true,
      keyMappings: "# Insert your preferred key mappings here.",
      linkHintCharacters: "sadfjklewcmpgh",
      linkHintNumbers: "0123456789",
      filterLinkHints: false,
      hideHud: false,
      userDefinedLinkHintCss: "div > .vimiumHintMarker {\n/* linkhint boxes */\nbackground: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#FFF785),\n  color-stop(100%,#FFC542));\nborder: 1px solid #E3BE23;\n}\n\ndiv > .vimiumHintMarker span {\n/* linkhint text */\ncolor: black;\nfont-weight: bold;\nfont-size: 12px;\n}\n\ndiv > .vimiumHintMarker > .matchingCharacter {\n}",
      exclusionRules: [
        {
          pattern: "https?://mail.google.com/*",
          passKeys: ""
        }
      ],
      previousPatterns: "prev,previous,back,older,<,\u2039,\u2190,\xab,\u226a,<<",
      nextPatterns: "next,more,newer,>,\u203a,\u2192,\xbb,\u226b,>>",
      searchUrl: "https://www.google.com/search?q=",
      searchEngines: "w: http://www.wikipedia.org/w/index.php?title=Special:Search&search=%s Wikipedia\n\n# More examples.\n#\n# (Vimium supports search completion Wikipedia, as\n# above, and for these.)\n#\n# g: http://www.google.com/search?q=%s Google\n# l: http://www.google.com/search?q=%s&btnI I'm feeling lucky...\n# y: http://www.youtube.com/results?search_query=%s Youtube\n# gm: https://www.google.com/maps?q=%s Google maps\n# b: https://www.bing.com/search?q=%s Bing\n# d: https://duckduckgo.com/?q=%s DuckDuckGo\n# az: http://www.amazon.com/s/?field-keywords=%s Amazon\n# qw: https://www.qwant.com/?q=%s Qwant",
      newTabUrl: "chrome://newtab",
      grabBackFocus: false,
      regexFindMode: false,
      waitForEnterForFilteredHints: false,
      settingsVersion: "",
      helpDialog_showAdvancedCommands: false,
      optionsPage_showAdvancedOptions: false,
      passNextKeyKeys: []
    }
  };

  Settings.init();

  if (Utils.isBackgroundPage()) {
    if (!Settings.get("settingsVersion")) {
      Settings.set("waitForEnterForFilteredHints", true);
    }
    Settings.set("settingsVersion", Utils.getCurrentVersion());
    Settings.nuke("copyNonDefaultsToChromeStorage-20150717");
  }

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Settings = Settings;

}).call(this);
