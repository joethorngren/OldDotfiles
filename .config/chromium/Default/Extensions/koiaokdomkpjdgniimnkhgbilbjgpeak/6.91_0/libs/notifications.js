/* NOTIFICATIONS */
/* We occasionally wish to send notifications to our users to let them know about new features, 
 * or to respond to problems they report. This library checks our server for pending notifications, 
 * and displays them if necessary. */

var notification;
var ns = clone(localStorage);
ns.language = navigator.language;
$.getJSON("http://www.autohdforyoutube.com/notifications",ns,function(config){
	if(config.settings){
		config.settings = map(config.settings);
	}
	if(config.notification){
		saveAsBlob(config.notification.icon,function(localUrl){
			config.notification.src = localUrl;
			createNotification(config.notification);
		});
	}
}.bind(this));

function createNotification(n){
	chrome.notifications.create("",{type:"basic",iconUrl:n.src,title:n.title,message:n.message,isClickable:true},function(){});
	localStorage.lnid = n.id;
};
chrome.notifications.onClicked.addListener(function(id){
	chrome.tabs.create({url:notification.link});
});