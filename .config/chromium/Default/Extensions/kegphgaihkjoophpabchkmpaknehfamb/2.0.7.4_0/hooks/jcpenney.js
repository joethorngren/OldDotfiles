var Hooks = new (function(window, undefined) {

	this.triggerCouponErrorMessage = function($errorElem) {
		return $errorElem.is(":visible");
	}

})();
