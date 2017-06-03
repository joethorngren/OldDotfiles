/**
 * Display rate us popup
 */
function rateUsVisibleChange(e) {
    e.preventDefault();
    var $modal = $('#rate-us-modal-content');
    $modal.modal({"backdrop" : "static"});
    $modal.on('hidden.bs.modal', function (e) {
        $("#footer-rate-us").fadeOut();
        BRW_sendMessage({command: "setApplicationNewtabRatingModal"});
    });
}

$(function() {
    $(document).on("click", ".options-application-rating-item", function(e) {
        e.preventDefault();
        
        var val = parseInt($(this).attr("data-rating"));
        
        var $modal = $('#rate-us-modal-content');
        
        BRW_getAcceptLanguages(function(languages){
            var hasRuLanguage = languages.indexOf("ru") != -1;
            if(val) {
                if(val == 2 || val == 3) {
                    /*
                    var url = optionsContactUrlEn;
                    
                    if (hasRuLanguage)
                        url = optionsContactUrlRu;
                    
                    openUrlInNewTab(url);
                    */
                    openUrlInNewTab("/pages/options/options.html#navi-faq-feedback");
                    
                    $modal.modal('hide');
                } else if(val == 4) {
                    $(".options-application-rating-popup-data").fadeOut("350", function() {
                        $(".options-application-rating-popup-stars").fadeIn("350", function() {
                            var url, $el = $(this);
                            
                            switch(browserName()){
                                case "firefox":
                                    if(hasRuLanguage) url = appStoreUrlFirefoxRu;
                                    else url = appStoreUrlFirefoxEn;
                                break;
                                case "opera":
                                    if(hasRuLanguage) url = appStoreUrlOperaRu;
                                    else url = appStoreUrlOperaEn;
                                break;
                                default: //chrome
                                    if(hasRuLanguage) url = appStoreUrlRu;
                                    else url = appStoreUrlEn;
                                break;
                            }//switch
                            
                            //console.info(browserName(), url);
                            
                            var openUrlTimeout = setTimeout(function() {
                                if(openUrlTimeout)
                                    clearTimeout(openUrlTimeout);
                                openUrlInNewTab(url);
                                $modal.modal('hide');
                            }, 2500);

                            $el.on("click", function() {
                                if(openUrlTimeout)
                                    clearTimeout(openUrlTimeout);
                                openUrlInNewTab(url);
                                $modal.modal('hide');
                            });
                        });
                    });
                } else if(val == 1)
                    $modal.modal('hide');
                BRW_sendMessage({command: "setApplicationRating", val: val});
            }
        });
    });
});