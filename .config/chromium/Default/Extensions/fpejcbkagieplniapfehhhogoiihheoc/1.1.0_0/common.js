function couponSumo(env) {
  var window = env.window;
  var document = window.document;
  var getUrl = env.getUrl;
  var emit = env.emit;
  var host = '';
  var opts = {};

  var initialized = false;
  var opened = false;
  var id = 'g7ewq89gwe798';
  var serverHost = '//www.couponsumo.com/';
  var noop = function () {};
  var closePopupFn = noop;
  var closeModalFn = noop;

  return {
    init: init,
    open: open
  };

  function init(_host_, _opts_) {
    host = _host_;
    opts = _opts_;
    if (!initialized && !opts.disabled) {
      initialized = true;
      open(host, opts);
    }
  }

  function open(_host_, _opts_) {
    host = _host_;
    opts = _opts_;
    if (opened) {
      return;
    }
    closeModalFn();
    opened = true;
    var wrapper = document.createElement('div');
    wrapper.setAttribute('id', id);
    wrapper.setAttribute('style', 'position:fixed;top:15px;right:15px;z-index:9999999990');
    var iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'width:236px;height:254px;margin:10px 10px 0 0;border:0;background: transparent; z-index: 999;position: absolute;top: 0;right: 0;');
    iframe.setAttribute('src', serverHost + 'extension/small-box?q=' + encodeURIComponent(host));
    iframe.setAttribute('allowtransparency', true);
    iframe.setAttribute('scrolling', 'no');
    wrapper.appendChild(iframe);
    var loader = document.createElement('div');
    var loaderImg = getUrl('img/ajax-loader.gif');
    loader.setAttribute('style', 'width:140px;height:120px;margin:16px 22px 0 0;border:0;background: #fff url(' +  loaderImg + ')  no-repeat center;box-shadow: 1px 1px 1px 1px #999;top:0;right:0;position:absolute;z-index: 99;border-radius: 5px;');
    wrapper.appendChild(loader);
    var close = document.createElement('div');
    var closeImage = getUrl('img/close.png');
    close.setAttribute('style', 'position:absolute;top:0;right:0;background:url(' +  closeImage + ') no-repeat top right;width:20px;height:20px;cursor:pointer; z-index: 9999');
    var escClick = function(evt) {
      evt = evt || window.event;
      if (evt.keyCode == 27) {
        emit('closePopup');
        closePopupFn();
      }
    };
    closePopupFn = function () {
      document.body.removeChild(wrapper);
      opened = false;
      window.removeEventListener("message", receiveMessage, false);
      document.removeEventListener('keydown', escClick, false);
      closePopupFn = noop;
    };
    close.onclick = function () {
      emit('closePopup');
      closePopupFn();
    };
    document.addEventListener('keydown', escClick, false);
    wrapper.appendChild(close);
    document.body.appendChild(wrapper);

    window.addEventListener("message", receiveMessage, false);
  }

  function receiveMessage(event) {
    if (!event.data || !event.data.target || event.data.target != id) {
      return;
    }
    var backdrop = document.createElement('div');
    backdrop.setAttribute('id', id + '_backdrop');
    backdrop.setAttribute('style', 'position:fixed;height:100%;left:0;top:0;right:0;width:100%;z-index:1999999999;background-color: rgba(0,0,0,0.4)');
    var wrapper = document.createElement('div');
    wrapper.setAttribute('id', id + '_modal');
    wrapper.setAttribute('style', 'position:fixed;left:50%;top:7%;z-index:9999999995;');
    var innerWrapper = document.createElement('div');
    innerWrapper.setAttribute('style', 'width:500px;height:550px;padding:10px;left:-50%;background-color: rgba(0,0,0,0.2);border-radius:5px;position:relative;');
    wrapper.appendChild(innerWrapper);
    var iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'width:100%;height:100%;border:0;background:#fff');
    iframe.setAttribute('src', event.data.href);
    iframe.setAttribute('allowtransparency', true);
    innerWrapper.appendChild(iframe);
    var close = document.createElement('div');
    var closeImage = getUrl('img/close36.png');
    close.setAttribute('style', 'position:absolute;top:-16px;right:-16px;background:url(' + closeImage + ') no-repeat top right;width:36px;height:36px;cursor:pointer;');
    var escClick = function(evt) {
      evt = evt || window.event;
      if (evt.keyCode == 27) {
        closeModalFn();
      }
    };
    document.addEventListener('keydown', escClick, false);
    closeModalFn = function () {
      document.body.removeChild(wrapper);
      document.body.removeChild(backdrop);
      opened = false;
      window.removeEventListener("message", receiveMessage, false);
      document.removeEventListener('keydown', escClick, false);
      closeModalFn = noop;
    };
    close.onclick = closeModalFn;
    backdrop.onclick = closeModalFn;
    innerWrapper.appendChild(close);
    document.body.appendChild(wrapper);
    document.body.appendChild(backdrop);
    closePopupFn();
    opened = true;
  }
}