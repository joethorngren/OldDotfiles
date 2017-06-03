/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */

function OptionsController(){"use strict";function a(){var a={};for(var b in H)H[b].forEach(function(b){a[b]=!1});Browser.sendToExtension({name:"main_getConfig",options:a,returnName:"options_config",toOwnWindow:B})}function b(){document.body.classList.toggle("loggedIn",!!L.userId),document.getElementById("username").textContent=L.email||"?",document.getElementById("options_showSaveToEvernote").style.display=M?"":"none",a(),e()}function c(a){accountSelector=new AccountSelector({globalContainer:document.querySelector("#main"),fieldContainer:document.querySelector("#accountSelector"),signInCallback:function(a,b,c){platform.channel.sendMessage("openSignIn",{userId:a,subpart:b,businessSSO:c}).then(function(c){c.success?(accountSelector.updateAccountTier(a,c.userInfo),accountSelector.setSelectedAccount(a,b),Browser.sendToExtension({name:"bounceToAll",message:{name:"gt_refresh"},toOwnWindow:B})):accountSelector.selectFirstLoggedIn()})},changeCallback:function(a,c){r(),platform.channel.sendMessage("setSelectedAccount",{selectedAccount:a,selectedSubpart:c}).then(function(){b()})}.bind(this)}),accountSelector.setData(a.list);var c=Object.keys(a.list);c.length<2&&a.list[c[0]].accountType!=GlobalUtils.ACCOUNT_TYPE_BUSINESS&&accountSelector.hideDropdown(),accountSelector.selectItem({selectedAccountId:a.selectedAccount,selectedSubpart:a.selectedSubpart})}function d(a){defaultAccountSelector=new AccountSelector({globalContainer:document.querySelector("#main"),fieldContainer:document.querySelector("#defaultAccount"),dropdownID:"defaultAccountDropdown",changeCallback:function(a,b){var c={defaultAccount:{id:a,subpart:b}};Browser.sendToExtension({name:"main_setOption",options:c})}}),defaultAccountSelector.setData(a.list);var b=Object.keys(a.list);b.length<2&&a.list[b[0]].accountType!=GlobalUtils.ACCOUNT_TYPE_BUSINESS&&(document.querySelector("#defaultClipping").style.display="none"),G=defaultAccountSelector.addOption({id:"defaultAccount",header:chrome.i18n.getMessage("Last_used"),description:"",callback:i,value:"last"})}function e(a){var b=accountSelector.getSelectedAccount().selectedSubpart;platform.channel.sendMessage("getNotebooks",{userId:L.userId,selectedSubpart:b,cached:a}).then(function(a){if(a){var c=b===GlobalUtils.ACCOUNT_TYPE_PERSONAL?a.personal:a.business;(b===GlobalUtils.ACCOUNT_TYPE_PERSONAL||accountSelector.getSelectedAccount().userInfo.isOnlyBusiness)&&(c=c.concat(a.linked)),notebookSelector.setNotebooks(c),void 0!==F&&F&&notebookSelector.selectNotebook(F)}}).catch(function(a){return log.error("Could not get notebooks "+a.msg),null})}function f(a,b,c){p(),a.options&&(h(a),GlobalUtils.localize(document.body),GlobalUtils.localize(document.getElementsByTagName("title")[0]),k(a),t(),""===document.querySelector("#startNotebook").innerHTML&&(notebookSelector=new NotebookSelector({container:document.querySelector("#startNotebook"),selectNotebookCallback:g,refreshNotebooksCallback:function(){e(!1)}})),e(!0),c&&"function"==typeof c&&c())}function g(){q();var a={};a.startNotebook=notebookSelector.getSelectedNotebook().guid,document.getElementById("alwaysStartInNotebook").click(),Browser.sendToExtension({name:"main_setOption",options:a})}function h(a){for(var b in H)switch(b){case"checkboxValues":H[b].forEach(function(b){var c=b,d=document.getElementById(c);d.checked=a.options[c],"enableKeyboardShortcuts"==c&&(d.checked||document.getElementById("shortcutsContainer").classList.add("disabled")),d.addEventListener("change",l)});break;case"selectValues":H[b].forEach(function(b){var c=b,d=document.getElementById(c);if("startNotebook"===c)L.userId&&(F=a.options[c]);else if("defaultAccount"===c){if(L.userId){var e=a.options[c];e.id?defaultAccountSelector.selectItem({selectedAccountId:e.id,selectedSubpart:e.subpart}):defaultAccountSelector.selectItem({field:G})}}else for(var f=a.options[c],g=0;g<d.options.length;g++)if(d.options[g].value==f){d.selectedIndex=g;break}d.addEventListener("change",m)});break;case"textValues":H[b].forEach(function(b){var c=b,d=document.getElementById(c);d.value=a.options[c],d.addEventListener("change",n)});break;case"radioValues":H[b].forEach(function(b){for(var c=b,d=document.getElementsByName(c),e=0;e<d.length;e++)d.item(e).value==a.options[c]&&(d.item(e).checked=!0),d.item(e).addEventListener("change",o)})}}function i(a,b,c){defaultAccountSelector.setSelectedField(c),defaultAccountSelector.closePopup();var d={};d[c.name]=c.value,Browser.sendToExtension({name:"main_setOption",options:d})}function j(a,b,c){var d=[],e=[],f=[];for(var g in a.options)a.options[g]!==I[g]&&(d.push(I[g]),e.push(a.options[g]),f.push(g));k(a),Browser.sendToExtension({name:"bounceToAll",message:{name:"updateKeyboardShortcut",oldShortcut:d,shortcut:e,shortcutName:f},toOwnWindow:B}),c&&"function"==typeof c&&c()}function k(a){I={},J={},K={},H.shortcutValues.forEach(function(b){var c=b,d=document.getElementById(c);I[c]=a.options[c],J[a.options[c]]=c;var e=new ShortcutSetter(d,a.options[c],"optionsPage",function(a,b){var c=a.id;if(J[b])return J[b]!=c&&(C=K[J[b]],C.showConflict(),{conflict:!0});if(/(\||^)27(\||$)/.test(b)&&"closeWebClipperShortcut"!==c)return{noEsc:!0};q();var d={};return d[c]=b,console.log("Sending options change:"),console.log(d),Browser.sendToExtension({name:"main_setOption",options:d}),Browser.sendToExtension({name:"bounceToAll",message:{name:"updateKeyboardShortcut",oldShortcut:I[c],shortcut:b,shortcutName:c},toOwnWindow:B}),delete J[I[c]],J[b]=c,I[c]=b,!1},function(){return!!z||(z=!0,!1)},function(){C&&(C.removeConflict(),C=null)},function(){return document.getElementById("shortcutsContainer").classList.contains("disabled")},function(a){return E[a]});K[c]=e})}function l(a){var b=this.id;if(b){q();var c={};c[b]=this.checked,"enableKeyboardShortcuts"==b&&(this.checked?document.getElementById("shortcutsContainer").classList.remove("disabled"):document.getElementById("shortcutsContainer").classList.add("disabled"),Browser.sendToExtension({name:"bounceToAll",message:{name:"receiveKeyboardShortcutsEnabled",keyboardShortcutsEnabled:this.checked}})),Browser.sendToExtension({name:"main_setOption",options:c})}t()}function m(a){var b=this.id;if(b){q();var c={};c[b]=this.options[this.selectedIndex].value,Browser.sendToExtension({name:"main_setOption",options:c})}t()}function n(a){var b=this.id;if(b){q();var c={};c[b]=this.value,console.log("Sending options change:"),console.log(c),Browser.sendToExtension({name:"main_setOption",options:c})}t()}function o(){var a=this.name;if(a){q();var b={};b[a]=this.value,Browser.sendToExtension({name:"main_setOption",options:b}),"notebookSelection"==a&&"alwaysStartIn"===this.value&&g()}t()}function p(){document.querySelector("#savingContainer").className="invisible"}function q(){document.querySelector("#loadingMessage").textContent=chrome.i18n.getMessage("options_saving"),window.setTimeout(function(){document.querySelector("#savingContainer").className="invisible"},500),document.querySelector("#savingContainer").className="visible"}function r(){document.querySelector("#loadingMessage").textContent=chrome.i18n.getMessage("loading"),document.querySelector("#savingContainer").className="visible"}function s(a){var b=document.getElementById("developerContainer").style;void 0===a&&(a="none"===b.display),b.display=a?"table-row-group":"none",t()}function t(){var a,b=document.querySelector(".pinch");b.classList.contains("shortcuts")&&(a=document.querySelector("#shortcutsContainer")),b.classList.contains("options")&&(a=document.querySelector("#optionsContainer")),b.classList.contains("legal")&&(a=document.querySelector("#legalContainer")),b.style.height="";var c=a.scrollHeight;b.style.height=a.scrollHeight+"px",Browser.sendToExtension({name:"bounce",message:{name:"setOptionsHeight",height:y+c},toOwnWindow:B})}function u(a,b){A&&["INPUT","TEXTAREA"].indexOf(b.nodeName)<0&&"true"!==b.contentEditable&&Browser.sendToExtension({name:"bounce",message:{name:"duplicateKeyboardShortcut",keycode:a},toOwnWindow:B})}function v(a,b){["INPUT","TEXTAREA"].indexOf(b.nodeName)<0&&"true"!==b.contentEditable&&Browser.sendToExtension({name:"bounce",message:{name:"duplicateKeyboardShortcut",keycode:a},toOwnWindow:B})}function w(a,b,c){if(A=a.enabled,a.handlers){var d={};for(var e in a.handlers)for(var f=0;f<a.handlers[e].length;f++)d[a.handlers[e][f]]="closeWebClipperShortcut"===e?v:u;Browser.addKeyboardHandlers(d)}c&&"function"==typeof c&&c()}function x(a,b,c){document.getElementsByClassName("pinch")[0].style.height=a.totalHeight-y+"px",c&&"function"==typeof c&&c()}var y=300,z=!1,A=!0;this.reset=function(){!0===confirm("Warning. This action will delete all persistent clipper data on this browser.")&&(q(),Persistent.clearAll(),log.log("Cleaned all local storage"),Browser.sendToExtension({name:"clearPersistent"}),Browser.sendToExtension({name:"main_clearOptions",options:H,type:"all"}),Browser.sendToExtension({name:"LOGOUT"}))};var B=!0;this.separateTab=function(a){return void 0!==a&&(B=a),B},/iframe/.test(document.location.hash)&&(B=!1),window.addEventListener("DOMContentLoaded",function(){window.addEventListener("click",function(a){Compatibility.openTab(a)}),document.querySelector("#main").addEventListener("click",function(a){notebookSelector&&notebookSelector.isOpened()&&notebookSelector.close()}),document.getElementById("signOut").addEventListener("click",function(){Browser.sendToExtension({name:"LOGOUT"}),Browser.sendToExtension({name:"trackEvent",category:"Account",action:"sign_out",endSession:!0})}),document.getElementById("resetShortcuts").addEventListener("click",function(){q(),Browser.sendToExtension({name:"main_clearOptions",options:H,type:"shortcutValues"})}),document.getElementById("done").addEventListener("click",function(){Browser.sendToExtension({name:"bounce",message:{name:"hideOptions",authed:!!L},toOwnWindow:B})}),EDGE&&document.getElementById("main").classList.add("isEdge"),Promise.all([platform.channel.sendMessage("getPersistentValue",{key:"charCodeCache"}),platform.channel.sendMessage("isExperimentActive",{name:"imageExperiment"}),platform.channel.sendMessage("getPersistentValue",{key:"devOptionsEnabled"}),platform.channel.sendMessage("getCurrentAccount")]).then(function(a){E=a[0]||{},L=a[3].userInfo||{},M=a[1]&&L.userId,s(!!a[2]),platform.channel.sendMessage("setPersistentValue",{key:"devOptionsEnabled",value:!1}),platform.channel.sendMessage("getAccountsData").then(function(a){Object.keys(a.list).length?(c(a),d(a)):b()})}).catch(function(a){log.error(a),L={},M=!1,b()})}),Browser.addMessageHandlers({options_config:f,optionsShortcutCleared:j,op_setKeyboardHandlers:w,op_setPinchHeight:x});var C,D,E,F,G,H={checkboxValues:["smartFilingTags","alwaysTagWith","useSearchHelper","enablePdfPageButton","saveToEvernote","simulateSimplifiedChinese","useStage","enableKeyboardShortcuts"],selectValues:["startNotebook","clipAction","defaultAccount"],textValues:["alwaysTags","insecureProto","secureProto","overrideServiceURL"],radioValues:["notebookSelection","defaultClipAction","afterClip","simulateClippingError"],shortcutValues:["startWebClipperShortcut","closeWebClipperShortcut","previewArticleShortcut","previewFullPageShortcut","previewUrlShortcut","selectionModeShortcut","takeScreenshotShortcut","clearlyShortcut","pdfShortcut","emailShortcut","expandArticleShortcut","contractArticleShortcut","moveArticleUpShortcut","moveArticleDownShortcut","toggleAccountShortcut","selectNotebookShortcut","addTagsShortcut","saveShortcut","minimizeClipperShortcut","selectAllMarkupShortcut","arrowShortcut","textShortcut","rectangleShortcut","roundedRectangleShortcut","ellipseShortcut","lineShortcut","markerShortcut","highlighterShortcut","stampShortcut","pixelateShortcut","cropShortcut","zoomInShortcut","zoomOutShortcut","zoomToFitShortcut","zoomToOriginalShortcut","undoShortcut","redoShortcut"]},I={},J={},K={},L={},M=!1;window.addEventListener("keydown",function(a){E&&(a.keyCode<65||a.keyCode>90)&&(D=a.keyCode)},!0),window.addEventListener("keypress",function(a){E&&D&&(D!=a.charCode&&(E[D]=a.charCode,Browser.sendToExtension({name:"setPersistentValue",key:"charCodeCache",value:E})),D=null)}),(new Konami).addCode(Konami.Code.Batman,s),Object.preventExtensions(this)}var accountSelector,notebookSelector,defaultAccountSelector;Object.preventExtensions(OptionsController);var optionsController=new OptionsController;window.addEventListener("DOMContentLoaded",function(){function a(a,b,c){if(a.bootstrapInfo&&a.bootstrapInfo.name){a.bootstrapInfo.name.match(/china/i)&&document.body.classList.add("china");var d="https://"+a.bootstrapInfo.serviceHost;document.getElementById("copyright").innerHTML=Browser.i18n.getMessage("copyright",[(new Date).getFullYear().toString(),d])+' | <a href="" id="resetAllOptionsFooter" message="options_resetAllOptions">'+Browser.i18n.getMessage("options_resetAllOptions")+"</a>",document.getElementById("resetAllOptions").addEventListener("click",optionsController.reset),document.getElementById("resetAllOptionsFooter").addEventListener("click",optionsController.reset),document.getElementById("logDescription").innerHTML=Browser.i18n.getMessage("options_eventLogDescription",[d+"/privacy"]);for(var e=document.getElementsByClassName("tab"),f=0;f<e.length;f++)e.item(f).addEventListener("click",function(){var a=document.querySelector(".tab.pressed");a&&(a.className=a.className.replace(/\s*pressed/g,""));var b=document.querySelector(".pinch");b.className=b.className.replace(/\s*(options|shortcuts|legal)/g,""),this.className+=" pressed","optionsTab"==this.id?b.className+=" options":"shortcutsTab"==this.id?b.className+=" shortcuts":"legalTab"==this.id&&(b.className+=" legal")});/shortcuts/.test(document.location.hash)&&document.getElementById("shortcutsTab").click(),c&&"function"==typeof c&&c()}}SAFARI&&document.body.classList.add("safari"),/iframe/.test(document.location.hash)&&window!=top&&document.body.classList.add("iframe"),Browser.addMessageHandlers({options_bconfig:a}),Browser.sendToExtension({name:"main_getConfig",bootstrapInfo:{name:null,serviceHost:null},toOwnWindow:optionsController.separateTab(),returnName:"options_bconfig"}),platform.channel.sendMessage("getPersistentValue",{key:"EVERNOTE_VERSION"}).then(function(a){document.getElementById("version").innerText=a+" ("+BUILD_VERSION+"/"+SKITCH_BUILD_VERSION+")"})}),window.addEventListener("error",function(a){log.error(JSON.stringify(a))});