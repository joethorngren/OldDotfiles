var $, PHOTO, getImagesSortType, uploadLocalImages, openUrlInNewTab, extensionGetUrl;
var photoHosting = (function () {
    function photoHosting() {
        this.$wrap = $("#available-image-themes");
        this.UI = {
            $wrap: this.$wrap,
            search: {
                $wrap: this.$wrap.find("#photo-search-form-wrap"),
                $form: this.$wrap.find("#photo-search-form"),
                $input: this.$wrap.find("#photo-search-input"),
                $list: this.$wrap.find("#photoSearchList"),
                $result: this.$wrap.find(".search-result"),
                $submit: this.$wrap.find("#photo-search-submit"),
                $hosting: this.$wrap.find("[name=hosting]")
            }
        };
        this.search = {
            hosting: false,
            last: false,
            text: false,
            tags: false,
            list: false,
            found: 0
        };
        this.APIkey = {
            flickr: '8c50a9edae6bb3d1f0b693cd0627c5e7',
            pixaby: '3599366-ce7ac208d52d0d2afe573c6fe'
        };
        this.API = {
            flickr: {
                key: this.APIkey.flickr,
                host: "https://api.flickr.com/services/rest/",
                search: "?method=flickr.photos.search&per_page=1800&format=json&nojsoncallback=1&media=photo&sort=interestingness-desc&privacy_filter=1&safe_search=1&api_key=" + this.APIkey.flickr + "&text=[search]",
                getImg: "?method=flickr.photos.getSizes&format=json&nojsoncallback=1&api_key=" + this.APIkey.flickr + "&photo_id=[photo_id]"
            },
            pixaby: {
                key: this.APIkey.flickr,
                host: "https://pixabay.com/api/",
                //search : `?key=${this.APIkey.pixaby}&response_group=high_resolution&orientation=horizontal&order=popular&category=backgrounds&pretty=true&q=[search]`,
                search: "?key=" + this.APIkey.pixaby + "&response_group=high_resolution&orientation=horizontal&order=popular&pretty=true&q=[search]"
            }
        };
        console.debug("Photo Start", this);
        this.Draw("init");
        this.Listeners();
    }
    ;
    photoHosting.prototype.Listeners = function () {
        var ts = this;
        //this.UI.search.$input.unbind("change").on("change", ()=>{ts.Search()});
        //this.UI.search.$input.unbind("keypress").on("keypress", ()=>{ts.Search()});
        this.UI.search.$submit.unbind("click").on("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            ts.Search("force");
        });
        this.UI.search.$form.on("submit", function (event) {
            event.preventDefault();
            event.stopPropagation();
            ts.Search("force");
        });
        this.UI.search.$hosting.on("change", function (event) {
            event.preventDefault();
            event.stopPropagation();
            ts.Search("force");
        });
        this.UI.$wrap.on("click", ".content-install", function (event) {
            ts.Install($(event.currentTarget));
        });
        this.UI.$wrap.on("click", ".content-view", function (event) {
            openUrlInNewTab(extensionGetUrl("/pages/newtab/newtab.html"));
        });
    };
    ;
    photoHosting.prototype.Draw = function (Actions) {
        if (typeof Actions != "object")
            Actions = [Actions || false];
        for (var _i = 0, Actions_1 = Actions; _i < Actions_1.length; _i++) {
            var action = Actions_1[_i];
            console.debug("Draw", action);
            switch (action) {
                case "init":
                    this.UI.$wrap.addClass("photoHosing");
                    this.UI.search.$wrap.removeClass('hide');
                    break;
            }
        }
    };
    ;
    photoHosting.prototype.Search = function (mode) {
        if (mode === void 0) { mode = "normal"; }
        this.Val();
        if (!this.search.text)
            return;
        else if (this.search.text == this.search.last && mode != "force")
            return;
        else
            this.search.last = this.search.text;
        this.GetList();
    };
    ;
    photoHosting.prototype.Val = function () {
        this.search.text = String(this.UI.search.$input.val()).trim();
    };
    ;
    photoHosting.prototype.GetList = function () {
        var _this = this;
        this.search.hosting = this.UI.search.$hosting.filter(":checked").val();
        console.debug(this.search.hosting);
        this.UI.$wrap.find(".av-content-container").remove();
        this.UI.search.$result.html("Loading...");
        if (this.search.hosting == "flickr") {
            console.debug("Search flickr", this.search.text);
            $.ajax({
                method: "GET",
                url: this.API.flickr.host + this.API.flickr.search.replace('[search]', this.search.text)
            })
                .done(function (list) {
                _this.FoundCounter(0);
                console.debug(list);
                var _loop_1 = function (photo) {
                    $.ajax({
                        method: "GET",
                        url: _this.API.flickr.host + _this.API.flickr.getImg.replace('[photo_id]', photo.id)
                    })
                        .done(function (photoData) {
                        //console.debug(photoData, photoData.sizes, photoData.sizes.candownload);
                        if (photoData.sizes.candownload == 1) {
                            var img = {
                                title: photo.title
                            };
                            for (var _i = 0, _a = photoData.sizes.size; _i < _a.length; _i++) {
                                var size = _a[_i];
                                if (size.media == "photo") {
                                    if (!img.thumb && size.width >= 250) {
                                        img.thumb = size.source;
                                    }
                                    if ((!img.source && size.width >= 1280 && size.width < 3500)
                                        ||
                                            (size.width > 1280 && size.width <= 2048)) {
                                        img.source = size.source;
                                        img.width = size.width;
                                        img.height = size.height;
                                        img.size = img.width + "x" + img.height;
                                        img.ratio = size.width / size.height;
                                    }
                                }
                            }
                            if (img.title && img.thumb && img.source
                                && img.ratio > 1.3 && img.ratio < 2.1) {
                                _this.FoundCounter(1 + _this.search.found);
                                _this.AddImage(img);
                            }
                        }
                    });
                };
                for (var _i = 0, _a = list.photos.photo; _i < _a.length; _i++) {
                    var photo = _a[_i];
                    _loop_1(photo);
                }
            })
                .fail(function () {
                _this.FoundCounter(0);
            });
        }
        else if (this.search.hosting == "pixaby") {
            console.debug("Search pixaby", this.search.text);
            console.debug(this.API.pixaby.host + this.API.pixaby.search.replace('[search]', this.search.text));
            $.ajax({
                method: "GET",
                url: this.API.pixaby.host + this.API.pixaby.search.replace('[search]', this.search.text)
            })
                .done(function (list) {
                _this.FoundCounter(0);
                console.debug(list);
                var images = [];
                for (var _i = 0, _a = list.hits; _i < _a.length; _i++) {
                    var photo = _a[_i];
                    var img = {
                        title: photo.user + " " + photo.type
                    };
                    if (photo.webformatURL)
                        img.thumb = photo.webformatURL;
                    else if (photo.previewURL)
                        img.thumb = photo.previewURL;
                    if (photo.fullHDURL) {
                        img.source = photo.fullHDURL;
                        img.size = 'FullHD';
                    }
                    else if (photo.largeImageURL) {
                        img.source = photo.largeImageURL;
                        img.size = 'HD';
                    }
                    else if (img.width > 1000 && img.height > 700) {
                        img.source = photo.imageURL;
                        img.width = photo.imageWidth;
                        img.hwight = photo.imageHeight;
                        img.size = img.width + "x" + img.height;
                    }
                    img.ratio = photo.imageWidth / photo.imageHeight;
                    if (img.title && img.thumb && img.source
                        && img.ratio > 1.3 && img.ratio < 2.1) {
                        _this.FoundCounter(1 + _this.search.found);
                        images.push(img);
                    }
                }
                _this.AddImage(images);
            })
                .fail(function () {
                _this.FoundCounter(0);
            });
        }
    };
    ;
    photoHosting.prototype.AddImage = function (images) {
        if (!images[0])
            images = [images];
        //console.debug(images);
        var $images = [];
        for (var _i = 0, images_1 = images; _i < images_1.length; _i++) {
            var img = images_1[_i];
            var $image = $("<div>").addClass("av-content-container");
            $image
                .append($("<div>")
                .addClass("av-content-title")
                .text("[" + img.size + "] " + img.title)
                .attr("title", "" + img.title))
                .append($("<div>")
                .addClass("av-content-img-container")
                .append($("<img>")
                .addClass("av-content-img")
                .attr("src", img.thumb)))
                .append($("<div>")
                .addClass("av-content-footer")
                .append($("<a>")
                .addClass("btn content-install btn-success")
                .attr("source", img.source)
                .text("Set Background"))
                .append($("<a>")
                .addClass("progress-bar progress-bar-warning progress-bar-striped active hide")
                .text("Downloading"))
                .append($("<a>")
                .addClass("btn btn-primary content-view hide")
                .text("View Background")));
            $images.push($image);
        }
        this.UI.$wrap.append($images);
    };
    ;
    photoHosting.prototype.FoundCounter = function (count) {
        this.search.found = count;
        this.UI.search.$result.html("Found " + this.search.found + " photos");
    };
    ;
    photoHosting.prototype.Install = function ($button) {
        this.UI.$wrap.find(".content-install").removeClass("hide");
        this.UI.$wrap.find(".content-view, .progress-bar").addClass("hide");
        var $container = $button.parents(".av-content-container");
        $container.find(".content-install").addClass("hide");
        $container.find(".progress-bar").removeClass("hide");
        var formData = {
            url: $button.attr("source"),
            title: $container.find(".av-content-title").attr("title")
        };
        console.debug("Install", formData);
        uploadLocalImages(formData);
    };
    ;
    photoHosting.prototype.Complete = function () {
        this.UI.$wrap.find(".progress-bar:not(.hide)")
            .addClass("hide")
            .parent().find(".content-view")
            .removeClass("hide");
    };
    ;
    return photoHosting;
}());
$(function () {
    if (getImagesSortType() == 2) {
        PHOTO = new photoHosting();
    }
});
