var couponSumoApi = couponSumo({
  window: window,
  getUrl: function (url) {
    return chrome.extension.getURL(url);
  },
  emit: function (event) {
    chrome.runtime.sendMessage({
      event: event,
      args: Array.prototype.slice.call(arguments, 1)
    });
  }
});

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.init) {
    couponSumoApi.init(request.host, request.opts);
  }
  if (request.click) {
    couponSumoApi.open(request.host, request.opts);
  }
});