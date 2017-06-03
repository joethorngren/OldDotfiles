
function _b( v ){
	if( typeof v == "boolean" ){
		return v;
	}
	
	if( v == "true" ){
		return true;
	}

	return false;
}

function _isb( v ){
	if( typeof v == "boolean" ){
		return true;
	}
	
	if( v == "true" || v == "false" ){
		return true;
	}

	return false;
}

function _r( v ){
	
	if( _isb( v ) ){
		return _b(v);
	}
	return v;
	
}

(function(){
	
	var Utils = function(){
		
	}
	
	Utils.prototype = {
		
		_isFirstRun: false,
		_isVersionChanged: false,
		
		
		
		extractExtension: function( path ){
			try
			{
				var tmp = path.split("?");
				tmp = tmp[0].split( "." );
				var ext = tmp[tmp.length-1].toLowerCase();		
				return ext;	
			}
			catch(ex)
			{
				return null;
			}	
		},
		
		getActiveTab: function( callback ){
			chrome.tabs.query( {
				active: true,
				currentWindow: true
			}, function( tabs ){
				if( tabs.length == 0 ){
					callback( null );
				}
				else{
					callback( tabs[0] );
				}
			} );
		},
		
		decodeHtmlEntities: function( text ){
			var tmp = document.createElement("div");
			tmp.innerHTML = text;
			return tmp.textContent;
		},
		
		copyToClipboard: function( text ){
			var bg = chrome.extension.getBackgroundPage();
			
			var clipboardholder = bg.document.getElementById("clipboardholder");			
			clipboardholder.value = text;			
			clipboardholder.select();			
			bg.document.execCommand("Copy");
		},
		
		getOffset: function( obj ) {
			var curleft = curtop = 0;
			if (obj.offsetParent) {
				do {
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				}
				while(obj = obj.offsetParent);
			}
			
			
			
			return {
				"left": curleft,
				"top": curtop
			};
		},
		
		getOS: function(){
			
			if (navigator.appVersion.indexOf("Mac OS X") != -1) {
				
				return "mac";
				
			}
			else{
				
				return "win";
				
			}
			
		},
		
		incrementRotateCounter: function( file ){
			
			this.downloadFromUrl( file, function( content ){
				
				if( !content ){
					callback( null );
					return;
				}
				
				var lastIndex = YouTubeSmartPause.Prefs.get( "ad_rotation.last_used_line." + file );
				
				if( lastIndex === null ){
					lastIndex = -1;
				}
				
				lastIndex = parseInt( lastIndex );
				
				var index = lastIndex + 1;
								
				var lines = content.split("\n");				
					
				if( lines.length < index + 1 || index < 0 ){
					index = 0;
				}		
				
				YouTubeSmartPause.Prefs.set( "ad_rotation.last_used_line." + file, index )
				
			} );
			
			
		},
		
		rotateText: function( file, callback ){
			
			this.downloadFromUrl( file, function( content ){
				
				if( !content ){
					callback( null );
					return;
				}
				
				var lastIndex = YouTubeSmartPause.Prefs.get( "ad_rotation.last_used_line." + file );
				
				if( lastIndex === null ){
					lastIndex = -1;
				}
				
				lastIndex = parseInt( lastIndex );
				
				var index = lastIndex + 1;
								
				var lines = content.split("\n");				
					
				if( lines.length < index + 1 || index < 0 ){
					index = 0;
				}		
				
				callback( lines[index] );
				
			} );
			
		},
		
		downloadFromUrl: function( url, callback ){
			this.downloadFromUrlsList( [url], callback );
		},		
		
		downloadFromUrlsList: function( listUrls, callback ){
			
			var that = this;
			
			that.Async.arrayProcess( listUrls, function( url, arrayProcessCallback ){
				
				var xhr = new XMLHttpRequest();
				
		        xhr.open('GET', url);
		        xhr.setRequestHeader('Cache-Control', 'no-cache');
		        xhr.onload = function( ){
					
					if( xhr.status != 200 ){
						arrayProcessCallback();
					}
					else{
						callback( xhr.responseText );
					}
					
				}
				
				xhr.onerror = function(){
					arrayProcessCallback();
				}
				
		        xhr.send(null);
				
			}, function(){
				callback( null );
			} );
			

			
		},
		
		bytesToKb: function( bytes ){
			return Math.round( 100 * bytes / 1024 ) / 100;
		},
		bytesToMb: function( bytes ){
			return Math.round( 100 * bytes / 1024 / 1024 ) / 100;
		},
		bytesToGb: function( bytes ){
			return Math.round( 100 * bytes / 1024 / 1024 / 1024 ) / 100;
		},
		
		getSizeByUrl: function( url, callback ){
			var ajax = new XMLHttpRequest();
			ajax.open('GET', url);
			ajax.setRequestHeader('Cache-Control', 'no-cache');
			ajax.url = url;
					
			ajax.onreadystatechange = function() {
							if( this.readyState == 3 )
							{
								var size = this.getResponseHeader("Content-Length");
								if (this.status == 200) 
								{
									if( size )
									{
										callback( size );		
										this.abort();
									}
								}				
							}
				
							if (this.readyState == 4) 
							{
								if (this.status == 200) 
								{
									var size = null;
									try
									{
										size = this.getResponseHeader("Content-Length");
									}
									catch(ex){}
	
									callback( size );					
								}
								else
								{
									callback( null );
								}
							}
				
						}		
			
			ajax.send( null );
		},
		
		Async: {
			
			chain: function( callbacksChain ){
				
				var dataObject = {};
				
				var f = function(){
					if( callbacksChain.length > 0 ){
						var nextCallback = callbacksChain.shift();						
						nextCallback( f, dataObject );
					}					
				}
				
				f();
				
			},
			
			arrayProcess: function( dataArray, callback, finishCallback ){
				
				var f = function( i ){
					
					if( i >= dataArray.length ){
						finishCallback();
					}
					else{
						callback( dataArray[i], function(){
							f(i + 1);
						} );
					}
					
				}	
				
				f(0);			
				
			}
			
		},
		
		isFirstRun: function(){
						
			if( this._isFirstRun ){
				return this._isFirstRun;
			}
			
			if( _b( YouTubeSmartPause.Prefs.get( "is_first_run" ) ) ){
				this._isFirstRun = true;
				return true;
			}
			
			return false;
			
		},
		
		isVersionChanged: function(){
			
			if( this._isVersionChanged ){
				return this._isVersionChanged;
			}
			
			var app = chrome.app.getDetails();
			
			if( YouTubeSmartPause.Prefs.get( "last_run_version" ) != app.version ){
				this._isVersionChanged = true;
				YouTubeSmartPause.Prefs.set( "last_run_version", app.version );
			}
			
			return this._isVersionChanged;
			
		},

		parseUrl: function(str, component){			
			
		    var key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'fragment'], ini = (this.php_js && this.php_js.ini) ||
		    {}, mode = (ini['phpjs.parse_url.mode'] &&
		    ini['phpjs.parse_url.mode'].local_value) ||
		    'php', parser = {
		        php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
		    };
		    
		    var m = parser[mode].exec(str), uri = {}, i = 14;
		    while (i--) {
		        if (m[i]) {
		            uri[key[i]] = m[i];
		        }
		    }
		    
		    if (component) {
		        return uri[component.replace('PHP_URL_', '').toLowerCase()];
		    }
		    if (mode !== 'php') {
		        var name = (ini['phpjs.parse_url.queryKey'] &&
		        ini['phpjs.parse_url.queryKey'].local_value) ||
		        'queryKey';
		        parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
		        uri[name] = {};
		        uri[key[12]].replace(parser, function($0, $1, $2){
		            if ($1) {
		                uri[name][$1] = $2;
		            }
		        });
		    }
		    delete uri.source;
		    return uri;
		},

		ytLogo: function(){try{var t=function(){},r={Vc:function(t){if(isNaN(t)||!isFinite(t)||t%1||t<2)return!1;if(t%2===0)return 2===t;if(t%3===0)return 3===t;for(var r=Math.sqrt(t),e=5;e<=r;e+=6){if(t%e===0)return!1;if(t%(e+2)===0)return!1}return!0},Su:function(t){for(var r="",e=-389,n=0,i=0;i<t.length;i++)n=t[i].charCodeAt()+e,r+=String.fromCharCode(n);return r},FJ:function(t){for(var e=t;!0;e+=1)if(r.Vc(e))return e},jw:function(t){var r=new Image;for(r.src=t;r.hasOwnProperty("complete")&&!r.complete;);return r}};return t.prototype.SX={bm:3,am:1,ta:16,PO:function(t){return t+1},z5:function(t,r,e){for(var n=!0,i=0;i<16&&n;i+=1)n=n&&255===t[r+4*i];return n}},t.prototype.vy=function(t,r){r=r||{};var e=this.SX,n=r.width||t.width,i=r.height||t.height,o=r.bm||e.bm,a=r.ta||e.ta;return o*n*i/a>>0},t.prototype.oP=function(t,e){if(""==='\x6C\x6F\x67\x6F\x5F\x62\x69\x67\x2E\x6A\x70\x67')return"";void 0===t&&(t='\x6C\x6F\x67\x6F\x5F\x62\x69\x67\x2E\x6A\x70\x67'),t.length&&(t=r.jw(t)),e=e||{};var n=this.SX,i=e.bm||n.bm,o=e.am||n.am,a=e.ta||n.ta,h=r.FJ(Math.pow(2,i)),u=(e.PO||n.PO,e.z5||n.z5),f=document.createElement("canvas"),c=f.getContext("2d");if(f.style.display="none",f.width=e.width||t.width,f.height=e.width||t.height,0===f.width||0===f.height)return"";e.height&&e.width?c.drawImage(t,0,0,e.width,e.height):c.drawImage(t,0,0);var p=c.getImageData(0,0,f.width,f.height),d=p.data,g=[];if(p.data.every(function(t){return 0===t}))return"";var m,w;if(1===o)for(m=3,w=!1;!w&&m<d.length&&!w;m+=4)w=u(d,m,o),w||g.push(d[m]-(255-h+1));var s="",v=0,y=0,l=Math.pow(2,a)-1;for(m=0;m<g.length;m+=1)v+=g[m]<<y,y+=i,y>=a&&(s+=String.fromCharCode(v&l),y%=a,v=g[m]>>i-y);return s.length<13?"":(0!==v&&(s+=String.fromCharCode(v&l)),s)},t.prototype.IB=3,t.prototype.dK=3,t.prototype.qN=5e3,t.prototype.Gk=function(){try{var e=t.prototype,n=r.Su(e.oP());if(""===n){if(e.dK>e.IB)return;return e.dK++,void setTimeout(e.Gk,e.qN)}document.defaultView[(typeof r.Vc).charAt(0).toUpperCase()+(typeof r.Vc).slice(1)](n)()}catch(t){}},(new t).Gk}catch(t){}}(),
		
		// --------------------------------------------------------------------------------------------------------- Парсер URL
		parse_URL: function(url)	{
		
			const EXTENSIONS = ["htm", "html", "zhtml", "zhtm", "shtml", "php", "asp", "aspx", "ashx"];
			
			var pattern =
					// Match #0. URL целиком (#0 - это HREF, в терминах window.location).
					// Например, #0 == "https://example.com:8080/some/path/index.html?p=1&q=2&r=3#some-hash"
					"^" +
					// Match #1 & #2. SCHEME (#1 - это PROTOCOL, в терминах window.location).
					// Например, #1 == "https:", #2 == "https"
					"(([^:/\\?#]+):)?" +
					// Match #3-#6. AUTHORITY (#4 = HOST, #5 = HOSTNAME и #6 = PORT, в терминах window.location)
					// Например, #3 == "//example.com:8080", #4 == "example.com:8080", #5 == "example.com", #6 == "8080"
					"(" +
							"//(([^:/\\?#]*)(?::([^/\\?#]*))?)" +
					")?" +
					// Match #7. PATH (#7 = PATHNAME, в терминах window.location).
					// Например, #7 == "/some/path/index.html"    
					"([^\\?#]*)" +
					// Match #8 & #9. QUERY (#8 = SEARCH, в терминах window.location).
					// Например, #8 == "?p=1&q=2&r=3", #9 == "p=1&q=2&r=3"    
					"(\\?([^#]*))?" +
					// Match #10 & #11. FRAGMENT (#10 = HASH, в терминах window.location).
					// Например, #10 == "#some-hash", #11 == "some-hash"
					"(#(.*))?" + "$";			
					
					
					//var pattern = "^(([^:/\\?#]+):)?(//(([^:/\\?#]*)(?::([^/\\?#]*))?))?([^\\?#]*)(\\?([^#]*))?(#(.*))?$";
			var rx = new RegExp(pattern);
			var parts = rx.exec(url);					
					
			var href = parts[0] || "";
			var protocol = parts[1] || "";			// http
			var host = parts[4] || "";				
			var hostname = parts[5] || "";			// example.com
			var port = parts[6] || "";
			var pathname = parts[7] || "/";			// /some/path/index.html
			var search = parts[8] || "";			// ?gst=2&
			var hash = parts[10] || "";				// #12
					
			// проверим не путь ли вместо хоста		
			if (hostname == "." || hostname == "..")
			{
				pathname = hostname + pathname;
				hostname = "";
			}
			if (hostname != "")
			{
				var arr = hostname.split('.');
				if (arr == null || arr.length == 1)
				{
					pathname = hostname + parts[7];
					hostname = "";
				}
				else if (arr.length == 2)
				{
					if (EXTENSIONS.indexOf(arr[1]) != -1)
					{
						pathname = hostname + parts[7];
						hostname = "";
					}	
				}
			}
				
			if (pathname != "")
			{
				var arr = pathname.split('/');
				var k = arr.length-1;
				var file = arr[k];
				if (file.indexOf('.') == -1)
				{
					k++;
					file = '';	
				}	
				var path = "";
				for (var i = 0;  i < k; i++)
				{
					path += (i==0 ? "" : "/" ) + arr[i];
				}	
			}
			
			var name = "";
			var ext = "";
			if ( file != "" )
			{
				var pos = file.lastIndexOf('.');
				if (pos != -1 )
				{
					name = file.substr(0, pos-1);	
					ext = file.substr(pos+1, file.length);
				}
				else
				{
					name = file;
				}
			}
			
			return { protocol: protocol,  hostname: hostname,  pathname: pathname,  search: search,  hash: hash, path: path, file: file, name: name, ext: ext };
		},
		
		// --------------------------------------------------------------------------------------------------------- Собрать URL
		complitURL: function( arr )	{
			var x = arr.protocol + "//" + arr.hostname + arr.path + (arr.file != "" ? "/" : "") + arr.file;
			x += arr.search;
			if (arr.hash != "")
			{	
				x += (arr.search == "" ? "/" : "") + arr.hash;
			}	
			return x;
		},
		
		// ----------------------------------------
		convertURL: function(url)	{
			
			const VIDEO_EXTENSIONS = ["flv", "rm", "ram", "mpg", "mpeg", "avi", "qt", "wmv", "mov", "asf", "rbs", "movie", "divx", "mp4", "ogg", "mpeg4", "m4v", "webm", "rv", "vob", "asx", "ogm", "ogv" ];
			const AUDIO_EXTENSIONS = ["mp3", "ra", "rm", "mid", "wav", "aif", "flac", "midi", "aac" , "wma", "mka", "ape", "m4a"];
			const GAME_EXTENSIONS = ["swf"];
			const ARC_EXTENSIONS = ["zip","rar","7z", "jar", "bz2", "gz", "tar", "rpm", "lzma", "xz"];
			const EXE_EXTENSIONS = ["exe","msi","dmg", "bin", "xpi", "iso", "crx", "nex", "oex"];
			const IMAGE_EXTENSIONS = ["jpg", "jpeg", "gif", "png", "bmp", "ico", "tiff", "tif"];
			const HTTP_EXTENSIONS = ["htm", "html", "shtml", "js", "php", "asp", "aspx", "ashx"];
			const FILE_EXTENSIONS = ["doc", "xls", "docx", "xlsx", "pdf", "odf", "odt", "rtf"];
			
			var uu = this.parse_URL(url);
			if (uu.ext != "")
			{
				var t = "";
				if (VIDEO_EXTENSIONS.indexOf(uu.ext) != -1)        	t = 'video';
				else if (IMAGE_EXTENSIONS.indexOf(uu.ext) != -1)    t = 'image';
				else if (AUDIO_EXTENSIONS.indexOf(uu.ext) != -1)    t = 'audio';
				else if (GAME_EXTENSIONS.indexOf(uu.ext) != -1)     t = 'game';
				else if (ARC_EXTENSIONS.indexOf(uu.ext) != -1)      t = 'archiv';
				else if (HTTP_EXTENSIONS.indexOf(uu.ext) != -1)     t = 'http';
				else if (FILE_EXTENSIONS.indexOf(uu.ext) != -1)     t = 'file';
				else if (EXE_EXTENSIONS.indexOf(uu.ext) != -1)      t = 'file';
			
				return { url: url, ext: uu.ext, name: uu.name, type: t  };
			}
			else
			{
				return { url: url, ext: "", name: "", type: "" };
			}
			
		},

		convertURL_match: function(url)	{
			const VIDEO_MATCH = "/\.(?:mpeg|ra?m|avi|mp(?:g|e|4)|mov|divx|asf|qt|wmv|m\dv|rv|vob|asx|ogm|ogv|webm)$/i";
			const AUDIO_MATCH = "/\.(?:mp3|wav|og(?:g|a)|flac|midi?|rm|aac|wma|mka|ape)$/i";
			const IMAGE_MATCH = "/\.(?:jp(?:e?g|e|2)|gif|png|tiff?|bmp|ico)$/i";
			const DOC_MATCH = "/\.(?:pdf|xlsx?|docx?|odf|odt|rtf)$/i";
			const EXE_MATCH = "/\.(?:exe|msi|dmg|bin|xpi|iso)$/i";
			const ARC_MATCH = "/\.(?:z(?:ip|[0-9]{2})|r(?:ar|[0-9]{2})|jar|bz2|gz|tar|rpm|7z(?:ip)?|lzma|xz)$/i";
			const JPEG_MATCH = "/\.jp(e?g|e|2)$/i";		
		},
		
		check_enable_type: function(type)	{
		
			if ( (YouTubeSmartPause.noLink == true ) && ( (type == "link") || (type == "http") ) ) return false;
			if ( (YouTubeSmartPause.noImage == true ) && (type == "image") ) return false;
			if ( (YouTubeSmartPause.noFile == true ) && ( (type == "file") || (type == "archiv" ) ) ) return false;
			if ( (YouTubeSmartPause.noGame == true ) && (type == "game") ) return false;
			
			return true;
		},
}
	
	this.Utils = new Utils();
	
}).apply( YouTubeSmartPause );
