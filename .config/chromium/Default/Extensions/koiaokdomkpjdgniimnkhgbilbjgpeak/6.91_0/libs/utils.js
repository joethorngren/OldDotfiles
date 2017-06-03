Array.prototype.unique = function(){
	var ko = {};
	this.forEach(function(item){
		ko[item] = 1;
	});
	return Object.keys(ko);
}
Array.prototype.remove = function(item){
	this.splice(this.indexOf(item),1);
}
Array.prototype.contains = function(item){
	return (this.indexOf(item) != -1);
}
function map(map,obj){
	obj = obj || this;
	$.each(map,function(k,v){
		obj[k] = obj[v];
	});
}
function clone(obj){
	return JSON.parse(JSON.stringify(obj));
}
function now(){
	return Math.floor((new Date()).getTime() / 1000);
}
function addScript(template){
	var s = document.createElement("script");
	if(template.src){
		s.src = template.src;
	}
	if(template.textContent){
		s.textContent = template.textContent;
	}
	document.documentElement.appendChild(s);
}
function saveAsBlob(url,callback){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'blob';
	xhr.onload = function(e) {
		if (this.status == 200) {
			var url = URL.createObjectURL(this.response);
			callback(url);
		}
	};
	xhr.send();	
}