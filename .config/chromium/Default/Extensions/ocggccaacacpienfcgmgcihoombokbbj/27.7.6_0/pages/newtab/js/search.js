    /**
     * Google search input
     * auto complete search results
     */

    var mySearchProvider = searchProviderLive;

    var googleSearchXhr,
        searchItemClass = "search-suggestion-item";
    

    BRW_getAcceptLanguages(function(languages){
        var isYandexSerach = languages.indexOf("ru") != -1;
        setSearchEngine(isYandexSerach);
    });

    /**
     * Get google search results
     *
     * @param e Event
     */
    function makeGoogleSearch(e) { 
        stopSpeechRecording();
                      
        if (e.keyCode == 27) { // press esc
            $("#search-suggestion").hide();
            $("#search-input-box").removeClass('with-suggestions');
        } else if(e.keyCode == 38) { // press arrow up
            moveSelectSuggestedItem(false);
        } else if(e.keyCode == 40) { // press arrow
            moveSelectSuggestedItem(true);
        } else if(e.keyCode == 37 || e.keyCode == 39) { // press left or right
            // do nothing
        } else {
            var $el = $(this);
            var enterChar = String.fromCharCode(e.keyCode);
            if(enterChar.trim()) {
                $el.removeAttr("data-search-url")
                   .removeAttr("data-use-google-search");

                if(googleSearchXhr) googleSearchXhr.abort();
                
                var $searchContainer = $("#search-suggestion"),
                    query = $el.val().trim(), i;
                var $searchBox = $("#search-input-box");
                
                if(query) {
                    //$searchBox.removeClass('with-suggestions');
                    
                    googleSearchXhr = BRW_ajax(
                        "http://google.com/complete/search?output=toolbar&q=" + encodeURIComponent(query),
                        function(answer){//successFunction
                            var searchResponse = googleSearchXhr.responseXML;
                            
                            if (searchResponse) {
                                var elements = searchResponse.getElementsByTagName("suggestion");
                                $searchContainer.html('');

                                if(elements.length)
                                    addSearchItemToList(query, $searchContainer, query.trim(), false);

                                for (i = 0; i < 3; i++) {
                                    if(typeof (elements[i]) != "undefined") {
                                        $elData = elements[i].getAttribute("data");
                                        if($elData) {
                                            $elData.trim();
                                            addSearchItemToList(query, $searchContainer, $elData, checkDataIsUrl($elData));
                                        }
                                    }
                                }

                                if(elements.length) {
                                    $(document).off('click', "." + searchItemClass, onSearchSuggestionItemClick)
                                        .on ('click',      "." + searchItemClass, onSearchSuggestionItemClick)
                                        .off('mouseenter', "." + searchItemClass, showSelectedSuggestedItem)
                                        .on ('mouseenter', "." + searchItemClass, showSelectedSuggestedItem)
                                        .off('mouseleave', "." + searchItemClass, hideSelectedSuggestedItem)
                                        .on ('mouseleave', "." + searchItemClass, hideSelectedSuggestedItem);
                                    $searchContainer.show();
                                    $searchBox.addClass('with-suggestions');
                                } else{
                                    $searchContainer.hide();
                                    $searchBox.removeClass('with-suggestions');
                                    
                                }
                            }
                            googleSearchXhr = null;
                            
                        },//successFunction
                        false, {'xml':true}
                    );
                    
                } else {
                    $searchContainer.hide();
                    $searchBox.removeClass('with-suggestions');
                }
            }
        }
    }

    /**
     * Add search item to search list
     *
     * @param searchQuery String
     * @param $searchContainer
     * @param itemVal String
     * @param isSiteUrl String
     */
    function addSearchItemToList(searchQuery, $searchContainer, itemVal, isSiteUrl) { 
        isSiteUrl = false;
        var searchGoogleImgUrl = extensionGetUrl("pages/newtab/img/common/search.png");
        var searchSiteImgUrl = extensionGetUrl("pages/newtab/css/img/buttons/tiles/site.png");

        var $searchBarItem = $("<div></div>").addClass(searchItemClass);
        var $searchBacItemImg = $("<img>").addClass("search-suggestion-img");
        var imgUrl = isSiteUrl ? searchSiteImgUrl : searchGoogleImgUrl;
        $searchBacItemImg.attr("src", imgUrl);

        var $searchBarItemText = $("<div></div>").addClass("search-suggestion-text");
        $searchBarItemText.text(itemVal);
        $searchBarItem.attr("data-search-text", itemVal);
        $searchBarItem.attr("data-search-url", isSiteUrl ? addDataUrlHttp(itemVal) : getRedirectSearchUrl(itemVal, mySearchProvider));
        $searchBarItem.attr("data-use-google-search", !isSiteUrl);
        $searchBarItemText.html(function(_, html) {
            return html.replace(new RegExp(searchQuery,"g"), '<b>$&</b>');
        });
        $searchBarItem.append($searchBacItemImg).append($searchBarItemText);
        $searchContainer.append($searchBarItem);
    }

    /**
     * Check data is url
     *
     * @param url String
     * @returns {boolean}
     */
    function checkDataIsUrl(url) { 
        //var regExp = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;

        var regExp = new RegExp(
            "^" +
                // protocol identifier
            "(?:(?:https?|ftp)://)?" +
                // user:pass authentication
            "(?:\\S+(?::\\S*)?@)?" +
            "(?:" +
                // IP address exclusion
                // private & local networks
            "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
            "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
            "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
                // IP address dotted notation octets
                // excludes loopback network 0.0.0.0
                // excludes reserved space >= 224.0.0.0
                // excludes network & broacast addresses
                // (first & last IP address of each class)
            "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
            "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
            "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
            "|" +
                // host name
            "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
                // domain name
            "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
                // TLD identifier
            "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
                // TLD may end with dot
            "\\.?" +
            ")" +
                // port number
            "(?::\\d{2,5})?" +
                // resource path
            "(?:[/?#]\\S*)?" +
            "$", "i"
        );

        return regExp.test(url);
    }

    /**
     * Add http to data url
     *
     * @param url String
     * @returns String
     */
    function addDataUrlHttp(url) { 
        if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
            url = "http://" + url;
        }
        return url;
    }

    /**
     * Move suggested item selection
     */
    function moveSelectSuggestedItem(direction) { 
        var $allSuggestedItems = $("." + searchItemClass);
        if($allSuggestedItems.length) {
            var $current = $("." + searchItemClass + ".selected");
            if($current.length) {
                $current.removeClass("selected");
                var $newElement = $current.prev();
                if(direction)
                    $newElement = $current.next();

                if(!$newElement.hasClass(searchItemClass))
                    if(direction)
                        $newElement = $allSuggestedItems.first();
                    else
                        $newElement = $allSuggestedItems.last();
            } else {
                $newElement = $allSuggestedItems.first();
            }
            $newElement.addClass("selected");

            var searchInput = $("#search-input").val('');
            var searchInputText = $newElement.attr("data-search-text");
            var searchInputUrl = $newElement.attr("data-search-url");
            var searchInputUseGoogleSearch = $newElement.attr("data-use-google-search");

            searchInput.val(searchInputText);
            searchInput.attr("data-search-url", searchInputUrl);
            searchInput.attr("data-use-google-search", searchInputUseGoogleSearch);
        }
    }

    /**
     * Show selected search suggested item
     */
    function showSelectedSuggestedItem() { 
        $("." + searchItemClass + ".selected").each(function() {
            $(this).removeClass("selected");
        });
        $(this).addClass("selected");
    }

    /**
     * Hide selected search suggested item
     */
    function hideSelectedSuggestedItem() { 
        $(this).removeClass("selected");
    }

    /**
     * Search suggestion item click handler
     *
     * @param e Event
     */
    function onSearchSuggestionItemClick(e) { 
        e.preventDefault();
        e.stopPropagation();
        var searchInput = $("#search-input").focus().val('');
        searchInput.parent().addClass("active");
        var searchInputText = $(this).attr("data-search-text");
        var searchInputUrl = $(this).attr("data-search-url");
        var searchInputUseGoogleSearch = $(this).attr("data-use-google-search");
        searchInput.attr("data-search-url", searchInputUrl);
        searchInput.attr("data-use-google-search", searchInputUseGoogleSearch);
        searchInput.val(searchInputText).off("keyup", makeGoogleSearch);
        $("#search-form").submit();
        $("#search-suggestion").hide();
        $("#search-input-box").removeClass('with-suggestions');
    }

    $(function() {

        /**
         * Search input field
         */
        $("#search-input").on("keydown", function() {
             var $el = $(this).parent();
             var $placeholder = $el.find("#search-placeholder");
             if($placeholder.is(":visible")) $placeholder.hide();
        });
        
        $("#search-input").on("click", function() {
             var $el = $(this).parent();
             var $placeholder = $el.find("#search-placeholder");
             if($placeholder.is(":visible")) $placeholder.hide();
        });
        
        $("#search-input").on("focusin", function() {
            var $el = $(this).parent();
            if(!$el.hasClass("active"))
                $el.addClass("active");
            var $placeholder = $el.find("#search-placeholder");
            if($placeholder.is(":visible"))
                $placeholder.hide();
            
            if($(this).val().trim()){
                setTimeout(function(){
                    $("#search-suggestion").show();//#117 added
                    $("#search-input-box").addClass('with-suggestions');

                }, 150);
            }
        }).on("focusout", function() {
            var $this = $(this);
            var $el = $this.parent();
            $el.removeClass("active");
            if(!$this.val())
                $el.find("#search-placeholder").show();
            
            setTimeout(function(){
                $("#search-suggestion").hide();//#117 added
                $("#search-input-box").removeClass('with-suggestions');
                
            }, 150);
            
        }).on("keyup", makeGoogleSearch);

        $(document).on("click", function() {
            var searchSuggestion = $("#search-suggestion");
            if(searchSuggestion.is(":visible")){
                searchSuggestion.hide();
                $("#search-input-box").removeClass('with-suggestions');
            }
        });

        $(document).on("submit", "#search-form", function(e) {
            e.preventDefault();
            var searchInput = $("#search-input");
            
            if(searchInput && searchInput.val()) {
                var searchVal = encodeURIComponent(searchInput.val().trim());
                if(searchVal) {
                    getSearchFormProviderType(function(searchProvider) {
                        BRW_sendMessage({command: "openSearchFormUrl", url: getRedirectSearchUrl(searchVal, searchProvider)});
                    }, true);
                }
            }
        });
        
        BRW_langLoaded(function(){BRW_getFileSystem(function(){
            getSearchFormProviderType(function(searchProvider) {
                mySearchProvider = searchProvider;
            }, true);
        });});
        
        
        getSearchEngineLabelModeAsync((val)=>{
            if(Boolean(val)){
                $("#search-provider-selector").removeClass("hide");
            }
        });
        
    });

