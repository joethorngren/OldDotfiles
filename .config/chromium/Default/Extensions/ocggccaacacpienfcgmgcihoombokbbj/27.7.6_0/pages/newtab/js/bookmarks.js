var $bookmarkImage;

/**
 * Display bookmarks popup
 */
function bookmarksVisibleChange(e) {
    e.preventDefault();
    BRW_getAcceptLanguages(function(languages){
        var hasRuLanguage = languages.indexOf("ru") != -1;

        var $bookmarksModalBody = $("#options-bookmarks-popup-body-img");

        var bookmarksFileName = "bookmarks_";
        var bookmarksFileExt = ".gif";
        var bookmarksShowUrlEn = bookmarksFileName + "en" + bookmarksFileExt;
        var bookmarksShowUrlRu = bookmarksFileName + "ru" + bookmarksFileExt;
        var bookmarksShowLangUrl = translate("page_header_bookmarks_help_img");

        var bookmarkImageUrl = bookmarksShowUrl;
        if(!bookmarksShowLangUrl)
            bookmarkImageUrl += hasRuLanguage ? bookmarksShowUrlRu : bookmarksShowUrlEn;
        else
            bookmarkImageUrl += bookmarksFileName + bookmarksShowLangUrl + bookmarksFileExt;

        var $modal = $('#bookmarks-modal-content');
        $modal.modal();
        $modal.on('shown.bs.modal', function() {
            if(!$bookmarkImage) {
                $bookmarkImage = $("<img>").attr("src", bookmarkImageUrl).addClass("options-bookmarks-popup-image");
                $bookmarkImage.on("load", function() {
                    $("#options-bookmarks-popup-body-load-img, #floatingBarsG").hide();
                });
                $bookmarksModalBody.append($bookmarkImage);
            }
        });
    });
}

$(function() {
    $(document).on("click", "#options-bookmarks-popup-close", function(e) {
        e.preventDefault();
        $("#bookmarks-modal-content").modal('hide');
        $("#header-bookmarks").fadeOut();
        chrome.runtime.sendMessage({command: "setBookmarksDisable"});
    });
});