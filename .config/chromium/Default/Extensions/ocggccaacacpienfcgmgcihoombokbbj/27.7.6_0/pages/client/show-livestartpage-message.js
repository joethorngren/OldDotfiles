if(typeof showLiveStartPageMessage == "undefined"){
    function showLiveStartPageMessage(message){
        var Width = 290;
        var Time = 3500;
        var Name = "LiveStartPageMessage_"+Date.now();
        
        var oldMessage = document.getElementById('LiveStartPageMessage');
        if(oldMessage) document.body.removeChild(oldMessage);
        
        var wrap = document.createElement("div");
            wrap.style.cssText = "position:fixed!important; bottom:1px!important; right:-"+Width+"px!important; width:"+(Width-10)+"px!important; padding:5px!important; background:white!important; border:1px solid #CCC!important; font-family: Geneva, Arial, Helvetica, sans-serif!important; cursor:pointer!important; z-index:2147483647!important";
            wrap.setAttribute("id", "LiveStartPageMessage");
            wrap.setAttribute("name", Name);
            
        var inner = document.createElement("div");
            inner.style.cssText = "width:100%!important; height:64px!important; position:relative!important";
            wrap.appendChild(inner);

        var icon = document.createElement("img");
            icon.style.cssText = "position:absolute!important; top:0!important; left:0!important; width:64px!important; height:64px!important;";
            icon.setAttribute("src", iconSource);
            inner.appendChild(icon);
        
        var title = document.createElement("div");
            title.style.cssText = "float:right!important; width:"+(Width-84)+"px!important; font-size:14px!important; font-weight:bold!important; text-align:center!important; color:#333!important;";
            title.appendChild(document.createTextNode("Live Start Page"));
            inner.appendChild(title);
        
        var text = document.createElement("div");
            text.style.cssText = "float:right!important; width:"+(Width-84)+"px!important; font-size:12px!important; font-weight:bold!important; text-align:center!important; color:#595!important; padding-top:5px!important;";
            text.appendChild(document.createTextNode(String(message)));
            inner.appendChild(text);
        
        
        document.body.appendChild(wrap);
        
        wrap.onclick = function(){
            var current = document.getElementsByName(Name);
            if(current.length) document.body.removeChild(current[0]);
        }
        
        var right = -1 * Width;
        var Show = setInterval(function(){
            right += 5;
            if(right > 0) right = 0;
            wrap.style.right = right+'px';
            if(right >= 0) clearInterval(Show);            
        }, 7);
        
        setTimeout(function(){
            var Hide = setInterval(function(){
                right -= 5;
                wrap.style.right = right+'px';
                if(right < (-1 * Width)){
                    clearInterval(Hide);            
                    
                    var current = document.getElementsByName(Name);
                    if(current.length) document.body.removeChild(current[0]);
                }//if                 
            }, 7);
        }, Time);
    }//function
    
    var iconSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpmZTBmOWUyYS0yNDJkLTBmNDItYmU2Mi0xMWQ4NDZiYTA4OTQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzRCQzZCMUE0M0Q2MTFFNTkwMUFEQjA3NjhFRDNCNkYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzRCQzZCMTk0M0Q2MTFFNTkwMUFEQjA3NjhFRDNCNkYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjYzNzFhZmQyLTIyZDMtNzU0Zi05MmM3LTQ1OGI0MGE0ODdhYiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpmZTBmOWUyYS0yNDJkLTBmNDItYmU2Mi0xMWQ4NDZiYTA4OTQiLz4gPC9y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";
}