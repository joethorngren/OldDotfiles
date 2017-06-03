$(document).ready(setup);

function setup(){
	$("[data-translate]").each(function(){
		var t = $(this).data("translate");
		var component = t.split(",");
		var output = "";
		$.each(t.split(","),function(c,key){
			var translation = chrome.i18n.getMessage(key); 
			output += (translation.length > 0) ? translation : key;
		});
		$(this).html(output);
	});
	
	chrome.storage.sync.get(function(settings){
		if(settings.quality){
			$("#qualitySelect").val(settings.quality);
		}
		if(settings.size){
			$("#sizeSelect").val(settings.size);
		}
	});
	
	$("#qualitySelect").change(function(){
		chrome.storage.sync.set({quality:$("#qualitySelect").val()},function(){
			chrome.tabs.reload();
		});
	})
	$("#sizeSelect").change(function(){
		localStorage.ytSize = $("#sizeSelect").val();
		chrome.storage.sync.set({size:$("#sizeSelect").val()},function(){
			chrome.tabs.executeScript(null,{code:"document.cookie = 'wide = " + localStorage.ytSize + "';"});
			chrome.tabs.reload();
		});
	})
	
	$("#rateButton").click(function(){
		chrome.tabs.create({url:"http://www.autohdforyoutube.com/rate"});
	});
	$("#reportButton").click(function(){
		chrome.tabs.create({url:"mailto:support@autohdforyoutube.com"});
	});
	
	chrome.runtime.sendMessage({name:"trackEvent",action:"Settings",label:""});
}