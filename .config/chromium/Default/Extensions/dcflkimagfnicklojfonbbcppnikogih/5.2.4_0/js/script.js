/**
 - author James D'Greeze
 - copyright 2013
 - http://dgreeze.pw
**/

/*chrome.extension.onMessage.addListener(function(req){

			if(req.msg == "rate") 	show_rate();
    
			console.log(req);
});*/

// --------------------------------------------------------		
function show_rate() {

	var div = document.createElement("div");
	div.setAttribute("id","SPYT_rateMsg");
	div.setAttribute("class","SPYT_rateMsg");
//	div.innerHTML = '<a href="#" id="SPYT_rateMsgC" class="SPYT_rateMsgC">x</a><strong>Нравится VK Theme?</strong><br>Пожалуйста оцените его.
//<div style="padding:3px 0 10px;position:relative;"><a href="https://chrome.google.com/webstore/detail/vk-themes-pro/ipjmkmdjhlokhmjljlnfcciaibbgfeoh/reviews" target="_blank">Супер! Мне нравится!</a>&nbsp;&nbsp;&nbsp;&nbsp;/ &nbsp;&nbsp;<a href="http://fvdmedia.userecho.com/list/21579-chrome-extensions/?category=7286" target="_blank">Плохо, мне не понравилось</a>&nbsp;&nbsp;&nbsp;&nbsp;/ &nbsp;&nbsp;<a href="http://fvdmedia.userecho.com/list/21579-chrome-extensions/?category=7286" target="_blank">Может быть лучше</a></div>
//<input type="checkbox" class="SPYT_dontshow" name="dontshow" id="dontshow"><label for="dontshow" class="SPYT_dontshowL">Не показывать больше</label>';
	document.documentElement.appendChild( div );
	
	var a1 = document.createElement("a");
	a1.setAttribute("class","SPYT_close");
	a1.setAttribute("href","#");
	a1.innerHTML='x';
	div.appendChild( a1 );

	var str1 = document.createElement("strong");
	str1.setAttribute("class","SPYT_strong1");
	str1.innerHTML='<b>Нравится VK Theme?</b>';
	div.appendChild( str1 );
	
	var str2 = document.createElement("strong");
	str2.setAttribute("class","SPYT_strong2");
	str2.innerHTML='<br>Пожалуйста оцените его.';
	div.appendChild( str2 );

	var div1 = document.createElement("div");
	div1.setAttribute("class","SPYT_action");
	div1.innerHTML='<a href="https://chrome.google.com/webstore/detail/vk-themes-pro/ipjmkmdjhlokhmjljlnfcciaibbgfeoh/reviews" target="_blank">Супер! Мне нравится!</a>&nbsp;&nbsp;&nbsp;&nbsp;/ &nbsp;&nbsp;<a href="http://fvdmedia.userecho.com/list/21579-chrome-extensions/?category=7286" target="_blank">Плохо, мне не понравилось</a>&nbsp;&nbsp;&nbsp;&nbsp;/ &nbsp;&nbsp;<a href="http://fvdmedia.userecho.com/list/21579-chrome-extensions/?category=7286" target="_blank">Может быть лучше</a>';
	div.appendChild( div1 );
	
	var inpt = document.createElement("input");
	inpt.setAttribute("class","SPYT_dontshow");
	inpt.setAttribute("type","checkbox");
	inpt.setAttribute("name","SPYT_dontshow");
	inpt.setAttribute("id","SPYT_dontshow");
	div.appendChild( inpt );
	
	var lbl = document.createElement("label");
	lbl.setAttribute("class","SPYT_dontshowL");
	lbl.setAttribute("for","SPYT_dontshow");
	lbl.innerHTML='Не показывать больше';
	div.appendChild( lbl );
	
}

// --------------------------------------------------------		
function init_rate() {

	chrome.extension.sendMessage('status_rate', function(backMessage){

		show_rate();
				
	});

}

// -------------------------------------------------------		
window.addEventListener("load",function( e ) {

	init_rate()
						
},false);

