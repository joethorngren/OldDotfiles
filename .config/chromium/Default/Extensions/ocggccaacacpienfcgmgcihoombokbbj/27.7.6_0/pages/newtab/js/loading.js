var MEDIA = localStorage.getItem("background-video-file") || localStorage.getItem("background-image-file") || false;

window.onload = function () {
    var loading   = localStorage.getItem("page-show-loading") || 0;
    var installed = localStorage.getItem("install-key");

    if (!installed || loading == 1) {
        localStorage.setItem("page-show-loading", 0);
        document.getElementById("loading").style.display = "block";
    }
}