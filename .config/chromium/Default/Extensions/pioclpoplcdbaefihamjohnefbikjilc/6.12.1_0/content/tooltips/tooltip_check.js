/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */

var X_OWA_CANARY="X-OWA-CANARY",X_OWA_UrlPostData="%7B%22request%22%3A%7B%22__type%22%3A%22GetExtensibilityContextParameters%3A%23Exchange%22%2C%22FormFactor%22%3A3%2C%22ClientLanguage%22%3A%22en-US%22%2C%22IncludeDisabledExtensions%22%3Atrue%7D%7D",EVERNOTE_OUTLOOK_ADDIN_ID="c427ff10-f2aa-43db-a07c-3bc19296e937";window===window.parent&&function(){function a(){h||(h=!0,i.animationHandler&&document.removeEventListener("animationstart",i.animationHandler),Browser.sendToExtension({name:"main_isAuthenticated",type:"tooltip",bootstrapInfo:{name:null}}))}function b(a,b){var c=!1;if(document.cookie)for(var d=document.cookie.split(";"),e=0;e<d.length;e++){var f=d[e].trim();if(0==f.indexOf(X_OWA_CANARY)){c=!0;var g=f.substring(X_OWA_CANARY.length+1),h=new XMLHttpRequest;h.open("POST",a+"/owa/service.svc?action=GetExtensibilityContext",!0),h.onreadystatechange=function(){if(4==h.readyState)if(200==h.status){var a=this.response,c=-1!=a.indexOf(EVERNOTE_OUTLOOK_ADDIN_ID);b(c)}else b(null,!0)},h.setRequestHeader("Action","GetExtensibilityContext"),h.setRequestHeader("X-OWA-UrlPostData",X_OWA_UrlPostData),h.setRequestHeader("X-OWA-CANARY",g),h.send()}}c||b(null,!0)}function c(a,b,c){a.auth&&(a.bootstrapInfo&&(g=a.bootstrapInfo),Browser.sendToExtension({name:"getPersistentFlag",key:i.persistentFlag+a.auth.userId})),c&&"function"==typeof c&&c()}function d(a,b,c){new RegExp("^"+i.persistentFlag).test(a.key)&&!0!==a.value&&Browser.sendToExtension({name:"getPersistentValue",key:"tooltipLastShown",recipient:i.tooltipFor}),c&&"function"==typeof c&&c()}function e(a){Browser.sendToExtension({name:"setPersistentValueForCurrentUser",key:"tooltipLastShown",value:new Date-0}),Browser.sendToExtension({name:"setPersistentFlag",key:i.persistentFlag+j,value:!0}),new TooltipCoordinator(Browser.extension.getURL("content/tooltips/tooltip.html#which="+i.persistentFlag+"&locale="+g.name+a),i.persistentFlag,"evernoteGmail")}function f(a,b,c){"tooltipLastShown"===a.key&&i&&i.tooltipFor===a.recipient&&(!a.value||!a.value[a.currentUserId]||a.value[a.currentUserId]+6048e5<=new Date-0)&&(j=a.currentUserId,i.getExtendedParameters?i.getExtendedParameters(e):e()),c&&"function"==typeof c&&c()}var g,h=!1,i=null,j="",k=[{animationHandler:function(b){a()},url:/^https:\/\/outlook\.live\.com\/owa\//,persistentFlag:"outlookTooltip",tooltipFor:"outlook",getExtendedParameters:function(a){b("https://outlook.live.com",function(b,c){a(b&&!c?"&addin_installed=true":"")})}},{animationHandler:function(b){a()},url:/^https:\/\/outlook-sdf\.live\.com\/owa\//,persistentFlag:"outlookTooltip",tooltipFor:"outlook",getExtendedParameters:function(a){b("https://outlook-sdf.live.com",function(b,c){a(b&&!c?"&addin_installed=true":"")})}},{animationHandler:function(b){a()},url:/^https:\/\/outlook\.office\.com\/owa\//,persistentFlag:"office365InboxTooltip",tooltipFor:"office365",getExtendedParameters:function(a){b("https://outlook.office.com",function(b,c){a(b&&!c?"&addin_installed=true":"")})}},{checkOnLoad:function(){return document.querySelectorAll("span > div > span > [src='images/cleardot.gif']").length>0},url:/^https:\/\/mail\.google\.com\/mail\//,animationHandler:function(b){b&&"nodeInserted"===b.animationName&&a()},persistentFlag:"gmailTooltip",tooltipFor:"gmail"}];Browser.addMessageHandlers({tooltip_isAuthenticated:c,receivePersistentFlag:d,receivePersistentValue:f});for(var l in k)if(k[l].url.test(document.location.href)){i=k[l],i.checkOnLoad&&i.checkOnLoad()&&a(),i.animationHandler&&document.addEventListener("animationstart",i.animationHandler);break}}();