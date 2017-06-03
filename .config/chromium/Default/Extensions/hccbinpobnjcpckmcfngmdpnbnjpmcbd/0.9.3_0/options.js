var groups,appsMap={},appCount=0,groupCount=0,visibleGroup;
function onLoad(){try{groups=JSON.parse(localStorage["group.list"]||"{}")}catch(c){groups={}}renderGroupList();chrome.management.getAll(function(b){appCount=0;b.forEach(function(a){appsMap[a.id]=a;appCount++});renderList(b)});$("#removeGroup").click(function(){var b=$("#editPopup").attr("groupId");b&&confirm("Really remove '"+b+"'? Notice that Apps and Extensions in the Group will NOT be uninstalled.")&&(delete groups[b],renderGroupList(),visibleGroup==b&&reloadList(),delete localStorage["_"+b+"_.order"],
localStorage["last.group"]==b&&delete localStorage["last.group"],localStorage["group.list"]=JSON.stringify(groups));$("#editPopup").removeAttr("groupId");$("#editPopup").hide()});$("#renameGroup").click(function(){var b=$("#editPopup").attr("groupId");if(b&&groups[b]){var a=prompt("Rename the group to","");a&&a!=""&&a!=b&&(groups[a]?alert("Group with the same name already exists"):(groups[a]=groups[b],delete groups[b],renderGroupList(),visibleGroup==b&&(visibleGroup=a,reloadList(a)),localStorage["last.group"]==
b&&(localStorage["last.group"]=a),localStorage["_"+b+"_.order"]&&(localStorage["_"+a+"_.order"]=localStorage["_"+b+"_.order"],delete localStorage["_"+b+"_.order"]),localStorage["group.list"]=JSON.stringify(groups)))}$("#editPopup").removeAttr("groupId");$("#editPopup").hide()});$("#cancelEdit").click(function(){$("#editPopup").hide()});$(openSettings).click(function(){chrome.tabs.create({url:"chrome://extensions"})})}function searchApp(){}
function renderGroupList(){groupCount=0;$("#groupList").empty();$("<div/>",{text:"All Apps & Extensions","class":"groupLabel",click:function(){reloadList()}}).appendTo($("#groupList"));$.each(groups,function(c){groupCount++;var b=$("<div/>",{text:c,"class":"groupLabel",click:function(){reloadList(c)}}).appendTo($("#groupList"));$("<span/>",{"class":"editGroup",text:"Edit",click:function(){$("#editPopup").css("top",$(this).offset().top);$("#editPopup").attr("groupId",c);$("#editPopup").show();return!1}}).appendTo(b)});
groupCount>0&&$("<div/>",{text:"Uncategorized","class":"groupLabel",click:function(){reloadOthers()}}).appendTo($("#groupList"))}function reloadList(c){visibleGroup=c;appCount=0;$("#appList").empty();$("#extList").empty();$("#appListTitle").text(c?c:"All Apps and Extensions");chrome.management.getAll(function(b){b.forEach(function(a){appsMap[a.id]=a;appCount++});renderList(b,c)})}
function reloadOthers(){visibleGroup="_AJ_OTHERS_";$("#appList").empty();$("#extList").empty();$("#appListTitle").text("Uncategorized Apps and Extensions");chrome.management.getAll(function(){var c={};$.each(groups,function(a,b){b.forEach(function(a){c[a]=!0})});var b=[];$.each(appsMap,function(a,f){a in c||b.push(f)});renderList(b,"_AJ_OTHERS_")})}
function renderList(c,b){!b||b=="_AJ_OTHERS_"?filtered=c:b&&(lists=groups[b],filtered=[],lists.forEach(function(a){filtered.push(appsMap[a])}));filtered.length==0?$("<div/>",{text:"No app or extension found in this group."}).appendTo($("#appList")):(filtered=filtered.sort(function(a,b){return a.name>b.name?1:-1}),filtered.forEach(function(a){if(a&&(a.icons||a.description||!a.enabled)){var c=$("<div/>",{"class":a.isApp?"appItem":"extItem"});a.enabled||c.addClass("disabled");if(a.icons){var d={},e=
{};a.icons.forEach(function(a){e[a.size]=a});if((d=e[48]||e[128]||e[32]||e[19]||e[16])&&d.url)d=$("<img/>",{src:d.url,align:"left",width:48,height:48,title:a.description}).appendTo(c),a.enabled||d.addClass("desaturate")}$("<div/>",{text:a.enabled?a.name:a.name+" (disabled)","class":"appItemLabel"}).appendTo(c);d=$("<div/>",{"class":"appInfoDiv"}).appendTo(c);$("<span/>",{text:"Version "+a.version,"class":"appItemVersion"}).appendTo(d);a.enabled&&a.optionsUrl&&$("<span/>",{text:"Options","class":"appItemOptions",
click:function(){chrome.tabs.create({url:a.optionsUrl})}}).appendTo(d);a.homepageUrl&&$("<a/>",{text:"Homepage","class":"appItemOptions",href:a.homepageUrl}).appendTo(d);d=$("<div/>",{"class":"appItemControls"}).appendTo(c);a.isApp&&$("<span/>",{text:"Launch",title:" Launch this app","class":"controlButton",click:function(){chrome.management.launchApp(a.id)}}).appendTo(d);$("<span/>",{text:a.enabled?"Disable":"Enable",title:(a.enabled?"Disable":"Enable")+" this app","class":"controlButton",click:function(){var b=
$(this);chrome.management.setEnabled(a.id,!a.enabled,function(){a.enabled=!a.enabled;b.text(a.enabled?"Disable":"Enable");c.find(".appItemLabel").text(a.enabled?a.name:a.name+" (disabled)");a.enabled?c.removeClass("disabled"):c.addClass("disabled")})}}).appendTo(d);$("<span/>",{text:"Uninstall",title:"Uninstall this app","class":"controlButton",click:function(){confirm('Are you sure you wish to uninstall "'+a.name+'" now?')&&chrome.management.uninstall(a.id,function(){c.remove()})}}).appendTo(d);
b&&b!="_AJ_OTHERS_"&&$("<span/>",{text:"Ungroup",title:"Remove this app from the current group","class":"controlButton",click:function(){b in groups&&(groups[b]=groups[b].filter(function(b){return b!=a.id}),localStorage["group.list"]=JSON.stringify(groups),c.remove())}}).appendTo(d);$("<span/>",{text:"Add to Group","class":"controlButton",title:"Add this app to a group",click:function(){groupCount==0?$("<div/>",{text:"Create New Group...","class":"createGroup",click:function(){var b=prompt("Enter a name for the new group",
"");b&&b!=""&&(addToGroup(b,a.id),$(this).remove())}}).appendTo(c):renderSelectGroupPopup(a)}}).appendTo(d);c.appendTo($(a.isApp?"#appList":"#extList"))}}))}function addToGroup(c,b){console.log("Add "+b+" to "+c);c in groups||(groups[c]=[]);var a=groups[c];a.filter(function(a){return a==b}).length==0&&a.push(b);localStorage["group.list"]=JSON.stringify(groups);renderGroupList()}
function renderSelectGroupPopup(c){var b=$(groupListPopup);b.empty();$("<h3>",{text:'Select a group for "'+c.name+'"'}).appendTo(b);$.each(groups,function(a){$("<div/>",{text:a,"class":"groupLabel",value:a,appId:c.id,click:function(){var a=$(this).val(),b=$(this).attr("appId");b&&(addToGroup(a,b),$(groupListBg).hide())}}).appendTo(b)});$("<br/>").appendTo(b);$("<div>",{text:"Add To New Group","class":"groupLabel",appId:c.id,click:function(){var a=$(this).attr("appId");if(a){var b=prompt("Enter a name for the new group",
"");b&&b!=""&&addToGroup(b,a);$(groupListBg).hide()}}}).appendTo(b);$("<div>",{text:"Cancel","class":"groupLabel",click:function(){$(groupListBg).hide()}}).appendTo(b);$(groupListBg).show()}$(document).ready(function(){onLoad()});
