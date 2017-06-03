/*
 Copyright (c) 2012 Amazon.com, Inc. All rights reserved.         *
*/
jQuery(function(c){var a=window.$SendToKindle={TPL_HISTORY_ROW:c("\x3ctr\x3e    \x3ctd class\x3d's2k-history-date'\x3e        \x3cspan class\x3d's2k-history-timespan'\x3e\x3c/span\x3e\x3cbr/\x3e        \x3cspan class\x3d's2k-history-day'\x3e\x3c/span\x3e\x3cbr/\x3e    \x3c/td\x3e    \x3ctd class\x3d's2k-history-entry'\x3e        \x3ca class\x3d's2k-history-link' target\x3d'_new'\x3e\x3c/a\x3e\x3cbr/\x3e        \x3cspan class\x3d's2k-history-url'\x3e\x3c/span\x3e    \x3c/td\x3e    \x3ctd class\x3d's2k-history-action'\x3e        \x3cdiv class\x3d's2k-history-delete'\x3e\x3c/div\x3e    \x3c/td\x3e\x3c/tr\x3e"),
TPL_HISTORY_EMPTY_ROW:c("\x3ctr class\x3d's2k-history-empty-entry'\x3e    \x3ctd class\x3d's2k-history-date'\x3e\x3c/td\x3e    \x3ctd class\x3d's2k-history-entry'\x3e\x3c/td\x3e    \x3ctd class\x3d's2k-history-action'\x3e\x3c/td\x3e\x3c/tr\x3e"),TX_READ_ONLY:"readonly",TX_READ_WRITE:"readwrite",historyTable:c(".s2k-history-table"),bootstrap:function(){a.modernize();a.loadStrings();a.registerEvents();a.onResize();a.loadHistory()},modernize:function(){window.indexedDB||(window.indexedDB=window.webkitIndexedDB,
window.IDBKeyRange=window.webkitIDBKeyRange,a.TX_READ_ONLY=window.webkitIDBTransaction.READ_ONLY,a.TX_READ_WRITE=window.webkitIDBTransaction.READ_WRITE)},registerEvents:function(){c(".s2k-history-clear").on("click",a.onHistoryClear);c(".s2k-history-close").on("click",a.onHistoryClose);c(window).on("resize",a.onResize)},loadStrings:function(){c.each(c("[s2k-string]"),function(){var a=c(this);a.text(chrome.i18n.getMessage(a.attr("s2k-string")))})},openStorage:function(a){var d=indexedDB.open("s2kwdb",
1);d.onerror=function(){a(null)};d.onsuccess=function(){a(d.result)};d.onupgradeneeded=function(a){a.target.result.createObjectStore("sendtokindle",{keyPath:"token"}).createIndex("s2k_idx_urls","url",{unique:!1})}},loadHistory:function(){a.openStorage(function(b){var d=[];if(null===b)a.onHistoryLoaded(d);else b.transaction(["sendtokindle"],a.TX_READ_ONLY).objectStore("sendtokindle").openCursor().onsuccess=function(b){if(b.target.result)d.push(b.target.result.value),b.target.result["continue"]();else a.onHistoryLoaded(d)}})},
onHistoryLoaded:function(b){a.historyTable.empty();b.sort(function(a,b){return b.timestamp-a.timestamp});for(var d=0;d<b.length;d++){var c=b[d],f=a.TPL_HISTORY_ROW.clone(),e=new Date(c.timestamp),g="",g=Date.today(),h=Date.today().add({days:-1}),g=g.getDate()===e.getDate()&&g.getMonth()===e.getMonth()&&g.getFullYear()===e.getFullYear()?chrome.i18n.getMessage("historyToday"):h.getDate()===e.getDate()&&h.getMonth()===e.getMonth()&&h.getFullYear()===e.getFullYear()?chrome.i18n.getMessage("historyYesterday"):
Math.ceil((Date.now()-e.getTime())/864E5)+chrome.i18n.getMessage("historyDaysAgo");f.find(".s2k-history-timespan").text(g);f.find(".s2k-history-day").text(e.toFormattedString("dd-MMM-yyyy"));f.find(".s2k-history-link").attr("href",c.url).text(c.title);f.find(".s2k-history-url").text(c.source);f.find(".s2k-history-delete").data("s2k-token",c.token);a.historyTable.append(f)}0===b.length?a.historyTable.append("\x3ctr\x3e\x3ctd class\x3d's2k-history-no-data'\x3e"+chrome.i18n.getMessage("historyNoData")+
"\x3c/td\x3e\x3c/tr\x3e"):(b=a.TPL_HISTORY_EMPTY_ROW.clone(),b.find("td").height(Math.max(a.historyTable.parent().height()-a.historyTable.height(),0)),a.historyTable.append(b));a.historyTable.find(".s2k-history-delete").off("click").on("click",a.onDeleteEntry)},onDeleteEntry:function(b){var d=c(b.target).data("s2k-token");void 0!==d&&a.openStorage(function(b){if(null!==b)b.transaction(["sendtokindle"],a.TX_READ_WRITE).objectStore("sendtokindle")["delete"](d)});c(b.target).fadeOut("fast",function(){c(b.target).parent().parent().remove()})},
onHistoryClear:function(){a.openStorage(function(b){null!==b&&(b.transaction(["sendtokindle"],a.TX_READ_WRITE).objectStore("sendtokindle").openCursor().onsuccess=function(a){a.target.result&&(a.target.result["delete"](),a.target.result["continue"]())})});a.onHistoryLoaded([])},onHistoryClose:function(){window.parent.postMessage("history-close","*")},onResize:function(){var b=c(window).height()-c(".s2k-history-header").height()-31-16;c(".s2k-history-data").height(b);c(".s2k-history-table-wrapper").height(b);
b=c(".s2k-history-empty-entry").find("td").height();c(".s2k-history-empty-entry").find("td").height(Math.max(a.historyTable.parent().height()-(a.historyTable.height()-b),0))}};a.bootstrap()});