/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */

!function(){var a={};a.checkAuthCookie=function(){var a=new XMLHttpRequest;a.open("GET","https://www.evernote.com/Home.action"),a.onreadystatechange=function(){4===this.readyState&&200===this.status&&(a.response.indexOf("MinimalLoginForm")>-1?log.log("AUTH cookie invalid"):log.log("AUTH cookie valid"))},a.send()},a.checkSSOCookie=function(a){!SAFARI&&chrome.cookies&&chrome.cookies.getAll({url:"https://"+a+"/",name:"clipper-sso"},function(a){if(a&&a.length){var b=new Date(0);b.setUTCSeconds(a[0].expirationDate),log.log("sso cookie found, valid till "+(a[0].expirationDate?b.toLocaleString():"--")+", now "+(new Date).toLocaleString())}})},window.DebugTools=a}();