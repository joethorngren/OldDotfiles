var appCount=0,groups,appsMap={},selectedGroup;
function renderList(c,d){selectedGroup=d;filtered=c;d&&((lists=groups[d])?(filtered=[],lists.forEach(function(a){appsMap[a]&&(delete appsMap[a].order,filtered.push(appsMap[a]))})):filtered=c);$("#appList").empty();$("<div/>",{"class":"noapps",html:"Sorry, No App matches your criteria."}).css("display","none").appendTo($("#appList"));var a=localStorage[d?"_"+d+"_.order":"_all_.order"];if(a)try{var b=JSON.parse(a);$.each(b,function(a,b){if(appsMap[b])appsMap[b].order=a})}catch(f){}filtered=filtered.sort(function(a,
b){return a.order&&b.order?a.order>b.order?1:-1:a.order||b.order?a.order?1:-1:a.name>b.name?1:-1});filtered.forEach(function(a){renderApp(a)});d?localStorage["last.group"]=d:(delete localStorage["last.group"],a=$("<div/>",{"class":"appItem ui-state-disabled",click:function(){chrome.tabs.create({url:"https://chrome.google.com/webstore"})}}),$("<img/>",{src:"/google_chrome_web_store.png",width:48,height:48}).appendTo(a),$("<div/>",{text:"Chrome Web Store","class":"appItemLabel"}).appendTo(a),a.appendTo($("#appList")));
$("#appList").sortable("enable");console.log(chrome.extension.getBackgroundPage());chrome.extension.getBackgroundPage().showUpdatePost()}
function renderGroupList(c){groupCount=0;var d=$("<div/>",{text:"All","class":"groupLabel",click:function(){$(".groupLabel").removeClass("selected");$(this).addClass("selected");$("#searchBox").attr("value","");chrome.management.getAll(function(a){renderList(a)})}}).appendTo($("#groupList"));c||d.addClass("selected");$.each(groups,function(a,d){if(d.filter(function(a){return appsMap[a]&&appsMap[a].isApp}).length>0){groupCount++;var e=$("<div/>",{text:a,"class":"groupLabel",click:function(){$(".groupLabel").removeClass("selected");
$(this).addClass("selected");$("#searchBox").attr("value","");chrome.management.getAll(function(c){renderList(c,a)})}}).appendTo($("#groupList"));c==a&&e.addClass("selected")}});if(groupCount==0)$("<a/>",{text:"+","class":"groupLabel",href:"options.html",target:"_weblauncher"}).appendTo($("#groupList"));else var a=$("<div/>",{text:"Others",id:"_AJ_OTHERS_","class":"groupLabel",title:"Apps not in groups",click:function(){$(".groupLabel").removeClass("selected");$(this).addClass("selected");$("#searchBox").attr("value",
"");chrome.management.getAll(function(a){renderOthers(a)})}}).appendTo($("#groupList"));c=="_AJ_OTHERS_"&&a.addClass("selected")}
function onLoad(){var c=localStorage["last.group"];try{groups=JSON.parse(localStorage["group.list"]||"{}")}catch(d){groups={}}chrome.management.getAll(function(a){a.forEach(function(a){appsMap[a.id]=a;appCount++});c=="_AJ_OTHERS_"?renderOthers(a):renderList(a,c);renderGroupList(c)});$("#appList").sortable({items:".appItem:not(.ui-state-disabled)",start:function(a,b){b.item.bind("click.prevent",function(a){a.preventDefault()});b.item.css("z-index","99999")},update:function(){var a=$("#appList").sortable("toArray");
localStorage[selectedGroup?"_"+selectedGroup+"_.order":"_all_.order"]=JSON.stringify(a)},stop:function(a,b){setTimeout(function(){b.item.unbind("click.prevent")},300);b.item.css("z-index","")},containment:"#appList",delay:30});$("#appList").click(function(a){a=$(a.target).closest(".appItem");a[0]&&a[0].id&&chrome.management.launchApp(a[0].id)});$("#appList").disableSelection();$("#searchBox").focus();$("#searchBox").keyup(function(){for(var a=$("#searchBox").attr("value"),b=$(".appItem"),c=0,d=0;d<
b.length;d++)$(".appItemLabel",b[d]).text().toLowerCase().indexOf(a)<0?$(b[d]).css("display","none"):($(b[d]).css("display",""),c++);c==0?$(".noapps").css("display","block"):$(".noapps").css("display","none")});$("#header").click(function(){chrome.tabs.create({url:"http://blog.visibotech.com/search/label/appjump"})});$(document).disableSelection&&$(document).disableSelection()}window.onkeydown=function(){$("#searchBox").focus();return!0};
function renderOthers(){var c={};$.each(groups,function(a,b){b.forEach(function(a){c[a]=!0})});var d=[];$.each(appsMap,function(a,b){!(a in c)&&b.isApp&&b.enabled&&d.push(a)});$("#appList").empty();d.forEach(function(a){renderApp(appsMap[a])});localStorage["last.group"]="_AJ_OTHERS_";$("#appList").sortable("disable")}
function renderApp(c){if(c&&c.isApp&&c.enabled){var d=$("<div/>",{"class":"appItem",id:c.id}),a={};if(c.icons){c.icons.forEach(function(b){a[b.size]=b});var b=a[48]||a[128];b&&b.url&&$("<img/>",{src:b.url,width:48,height:48}).appendTo(d)}else $("<img/>",{src:"/icon48.png",width:48,height:48}).appendTo(d);$("<div/>",{text:c.name,"class":"appItemLabel"}).appendTo(d);d.appendTo($("#appList"))}}$(document).ready(function(){onLoad()});