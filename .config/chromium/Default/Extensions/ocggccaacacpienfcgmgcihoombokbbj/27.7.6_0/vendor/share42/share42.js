/* share42.com | 23.09.2014 | (c) Dimox */
$(function() {
    BRW_getAcceptLanguages(function(languages){
    //chrome.i18n.getAcceptLanguages(function(languages){
        var fbQuery, u, t, i, d, f, fn, vkImage, odkImage;
        var popupLeft = $(document).width() / 2 - 312;
            popupLeft = popupLeft ? popupLeft : 100;
        var popupTop = $(document).height() / 2 - 184;
            popupTop = popupTop ? popupTop : 100;
        var popupSettings = "scrollbars=0, resizable=1, menubar=0, left=" + popupLeft + ", top=" + popupTop + ", width=605, height=443, toolbar=0, status=0";

        var hasRuLanguage = languages.indexOf("ru") != -1;
        var $container = $(".share42init");
        var $topContainer = $(".share42init-top");

        var shareUrl = getShareUrl();
        var shareUrlPart = translate("options_share_social_url");

        if(shareUrlPart) {
            if(shareUrlPart != "en")
                shareUrl += shareUrlPart + "/";
        } else {
            shareUrl = hasRuLanguage ? getShareRuUrl() : shareUrl;
        }  
        
        
        //var text = translate("options_share_social_popup_title");
        var text = translate("options_share_social_text_"+String(Math.floor(Math.random()*5)+1));

        $container.attr("data-url", shareUrl);
        $container.attr("data-title", translate("options_share_social_title"));
        $container.attr("data-description", text);
        $container.attr("data-image", "http://livestartpage.com/icons/share/1261u7kqjk.png");
        $container.attr("data-path", extensionGetUrl("/vendor/share42/"));
        $container.attr("data-icons-file", extensionGetUrl("/vendor/share42/icons.png"));

        $("#popup-share-app-dialog-title").html(translate("options_share_social_description"));
        $("#popup-share-app-dialog-text-1").html(translate("options_share_social_popup_text_1"));
        $("#popup-share-app-dialog-text-2").html(translate("options_share_social_popup_text_2"));
        $("#popup-share-app-dialog-text-3").html(translate("options_share_social_popup_text_3"));
        $("#popup-share-app-dialog-text-4").html(translate("options_share_social_popup_text_4"));

        var e = document.getElementsByTagName('div');
        for (var k = 0; k < e.length; k++) {
            if (e[k].className.indexOf('share42init') != -1) {
                if (e[k].getAttribute('data-url') != -1)
                    u = e[k].getAttribute('data-url');
                if (e[k].getAttribute('data-title') != -1)
                    t = e[k].getAttribute('data-title');
                if (e[k].getAttribute('data-image') != -1)
                    i = e[k].getAttribute('data-image');
                if (e[k].getAttribute('data-description') != -1)
                    d = e[k].getAttribute('data-description');
                if (e[k].getAttribute('data-path') != -1)
                    f = e[k].getAttribute('data-path');
                if (e[k].getAttribute('data-icons-file') != -1)
                    fn = e[k].getAttribute('data-icons-file');
                if (!f) {
                    function path(name) {
                        var sc = document.getElementsByTagName('script'), sr = new RegExp('^(.*/|)(' + name + ')([#?]|$)');
                        for (var p = 0, scL = sc.length; p < scL; p++) {
                            var m = String(sc[p].src).match(sr);
                            if (m) {
                                if (m[1].match(/^((https?|file)\:\/{2,}|\w:[\/\\])/))return m[1];
                                if (m[1].indexOf("/") == 0)return m[1];
                                b = document.getElementsByTagName('base');
                                if (b[0] && b[0].href)return b[0].href + m[1]; else return document.location.pathname.match(/(.*[\/\\])/)[0] + m[1];
                            }
                        }
                        return null;
                    }

                    f = path('share42.js');
                }
                if (!u)u = location.href;
                if (!t)t = document.title;
                if (!fn)fn = extensionGetUrl("/vendor/share42/icons.png");
                function desc() {
                    var meta = document.getElementsByTagName('meta');
                    for (var m = 0; m < meta.length; m++) {
                        if (meta[m].name.toLowerCase() == 'description') {
                            return meta[m].content;
                        }
                    }
                    return '';
                }

                if (!d)d = desc();
                t = encodeURIComponent(t);
                t = t.replace(/\'/g, '%27');
                i = null; //encodeURIComponent(i); //i
                d = d.split('[LINK]').join(u);
                d = encodeURIComponent(d);
                d = d.replace(/\'/g, '%27');
                u = encodeURIComponent(u);
                
                fbQuery = 'u=' + u;
                
                if (i != 'null' && i != '')
                    fbQuery = 's=100&p[url]=' + u + '&p[title]=' + t + '&p[summary]=' + d + '&p[images][0]=' + i;

                
                vkImage = odkImage = '';
                if (i != 'null' && i != '') {
                    vkImage = '&image=' + i;
                    odkImage = '&image=' + i;
                }

                var s = [
                    {
                        "id" : "share-button-fb",
                        "big-img" : "fb.png",
                        "data-count" : "fb",
                        "text" : "Facebook"
                    },
                    {
                        "id" : "share-button-twi",
                        "big-img" : "twi.png",
                        "data-count" : "twi",
                        "text" : "Twitter"
                    }
                ];

                if (hasRuLanguage) {
                    s.push({
                        "id": "share-button-vk",
                        "big-img" : "vk.png",
                        "data-count": "vk",
                        "text": "VK"
                    });
                    s.push({
                        "id": "share-button-odn",
                        "big-img" : "odn.png",
                        "data-count": "odn",
                        "text": "Однокласники"
                    });
                }

                var $shareBigContainer = $("<span></span>").attr("id", "share42-big").addClass("share42-big");
                for (j = 0; j < s.length; j++) {
                    var $shareBigItem = $("<div></div>").addClass("share-button-big-instance");
                    if(hasRuLanguage)
                        $shareBigItem.addClass("share-button-big-instance-sm-column");
                    else
                        $shareBigItem.addClass("share-button-big-instance-column");

                    for(var k in s[j]) {
                        if(k == "big-img") {
                            var $shareBigImage = $("<img>").addClass("share-button-image-big-instance");
                            $shareBigImage.attr("src", extensionGetUrl("/vendor/share42/" + s[j][k]));
                            $shareBigItem.append($shareBigImage);
                        } if(k == "text") {
                            var $shareBigText = $("<div></div>").addClass("share-button-text-big-instance");
                            var shareBigTextString = translate("options_share_social_popup_btn_unlock") + "<br>" + s[j][k];
                            $shareBigText.html(shareBigTextString);
                            $shareBigItem.append($shareBigText);
                        } else {
                            var attrVal = s[j][k];
                            if(k == "id") {
                                attrVal+= "-big";
                                $shareBigItem.addClass(attrVal);
                            }
                            $shareBigItem.attr(k, attrVal);
                        }
                    }
                    $shareBigContainer.append($shareBigItem);
                }
                $container.append($shareBigContainer);

                var $shareContainer = $("<span></span>").attr("id", "share42").addClass("share42");
                
                
                
                for (j = 0; j < s.length; j++) {
                    var $shareItem = $("<a></a>").addClass("share-button-instance").attr("target", "_blank");
                    for(var k in s[j])
                        $shareItem.attr(k, s[j][k]);
                    $shareItem.css({"background" : "url(" + fn + ") -" + 32 * j + "px 0 no-repeat"});
                    $shareContainer.append($shareItem);
                }
                $topContainer.append($shareContainer);
            }
        }
        /*
        if (hasRuLanguage) {
            var $vkItem = $("<a></a>")
                .addClass("btn btn-success")
                .attr("target", "_blank")
                .text('vkvkvk');

            $('.share42init-top').append($vkItem);
        }
        */
        $(document).on("click", ".share-button-instance, .share-button-big-instance", function(e) {
            e.preventDefault();
            if(!getShareAppStatus()) {
                //chrome.runtime.sendMessage(
                BRW_sendMessage({command: "setShareAppStatus"});
                if($(this).hasClass("share-button-big-instance")) {
                    if(!getShareGaEventStatus()) {
                        sendToGoogleAnaliticMP(function() {
                            gamp('send', 'event', 'flixel', 'share', '', 1);
                        });
                        setShareGaEventStatus();
                    }
                }
            }
        });

        $(document).on("click", ".share-fb-win, #share-button-fb, #share-button-fb-big", function(e) {
            e.preventDefault();
            window.open("http://www.facebook.com/sharer.php?m2w&" + fbQuery, "_blank", popupSettings);
        });

        $(document).on("click", ".share-twitter-win, #share-button-twi, #share-button-twi-big", function(e) {
            e.preventDefault();
            u = "";
            window.open("http://twitter.com/intent/tweet?text=" + d + "&url=" + u, "_blank", popupSettings);
        });

        $(document).on("click", ".share-vk-win, #share-button-vk, #share-button-vk-big", function(e) {
            e.preventDefault();
            //u = "";
            window.open("http://vk.com/share.php?url=" + u + "&title=" +  t + vkImage + "&description=" + d, "_blank", popupSettings);
        });

        $(document).on("click", ".share-ok-win, #share-button-odn, #share-button-odn-big", function(e) {
            e.preventDefault();
            //u = "";
            window.open("http://ok.ru/dk?st.cmd=addShare&st.s=1&st._surl=" + u + odkImage + "&st.comments=" + d, "_blank", popupSettings);
        });
    });
});