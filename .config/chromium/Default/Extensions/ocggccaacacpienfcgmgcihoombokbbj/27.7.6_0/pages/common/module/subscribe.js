$(()=>{
    $("[hrefout]").unbind("click").on("click", (el)=>{
        openUrlInNewTab($(el.currentTarget).attr("hrefout"));
    });
    
    subscribeShowHandler();
    
});

var fbFollowUrl = "https://www.facebook.com/plugins/follow.php?href=https%3A%2F%2Fwww.facebook.com%2Flivestartpage%2F&width=138&height=21&layout=button_count&size=large&show_faces=true&appId";

function subscribeShowHandler(){
    var install = parseInt(localStorage.getItem('install-key')) || parseInt(localStorage.getItem('installed-key'));
        
    if(install && !isNaN(install)){
        var done = localStorage['subscribe-done'] || false;
        var dont = localStorage['subscribe-dont-show'] || false;
        
        if(!done && !dont){
            var last = parseInt(localStorage['subscribe-shown']) || 0;
            var now = Date.now();
            var day = 24 * 60 * 60 * 1000;
            
            if(
                (
                    last === 0 &&
                    now - install > day * 3
                ) || (
                    last > 0 &&
                    now - last > day * 7
                )
            ){
                var $modal = $("#subscribe-app-dialog");//.modal();
                var $iframe = $modal.find("iframe");
                
                $iframe.attr("src", fbFollowUrl);
                
                $modal.modal();
                
                $modal.find("a").on("click", (e)=>{
                    setSubscribeDone();
                });
                
                $modal.find(".dont-show-it-anymore").on("click", (e)=>{
                    setSubscribeNever();
                });
                
                if(true){// iFrame click detect
                    var overFrame = -1;
                    
                    $iframe.hover( function() {
                        overFrame = 1;
                    }, function() {
                        overFrame = -1;
                    });


                    $(window).blur( function() {
                        if( overFrame != -1 ) setSubscribeDone();
                    });
                }
                
                $modal.on('hidden.bs.modal', function () {
                    setSubscribeLater();
                });
                
                function setSubscribeDone(){
                    localStorage.setItem('subscribe-done', Date.now());
                }
                function setSubscribeLater(){
                    localStorage.setItem('subscribe-shown', Date.now());
                }
                function setSubscribeNever(){
                    localStorage.setItem('subscribe-dont-show', Date.now());
                    $modal.modal("hide");
                }
                
                autosizeFbFrame($iframe);
            }
        }
    }
}

function autosizeFbFrame($iframe){
    try{
        $.ajax({ // start before dom is ready
            url: fbFollowUrl,
            type: 'get',
            dataType: 'html',
            success: function(data) {
                var $data = $(data);
                var txt = String($data.find("div:eq(0)").text());
                var len = 1 + txt.length;

                var width = 138;
                
                if(len == 9) width = 96;
                else if(len == 14) width = 138;
                else if(len > 8) width = Math.round(len * 10.5);
                
                $iframe.css("width", width);
            }
        }); 
    }catch(ex){
        console.warn(ex);
    }
}