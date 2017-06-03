var Settings = bg.Settings;
var amount;
var licenseType = "singleUser";
var licenseSelected;
var minimumDonation = 1; // but being set overwritten when donate buttons are clicked

var donateButtonClicked = null;
var extensionName = getMessage("nameNoTM");
var email;

Controller();

function showLoading() {
	$("body").addClass("processing");
}

function hideLoading() {
	$("body").removeClass("processing");
}

if (!extensionName) {
	try {
		extensionName = chrome.runtime.getManifest().name;
	} catch (e) {
		console.error("Manifest has not been loaded yet: " + e);
	}
	
	var prefix = "__MSG_";
	// look for key name to message file
	if (extensionName && extensionName.match(prefix)) {
		var keyName = extensionName.replace(prefix, "").replace("__", "");
		extensionName = getMessage(keyName);
	}
}

function isSimilarValueToUS(currencyCode) {
	if (/USD|CAD|EUR|GBP|AUD/i.test(currencyCode)) {
		return true;
	}
}

function initCurrencyAndMinimums(currencyCode) {
	if (licenseType == "multipleUsers") {
		$("#currency")[0].selected = "USD"; // hard coded to USD for multipe user license
	} else {
		$("#currency")[0].selected = currencyCode;

		if (isSimilarValueToUS(currencyCode) || currencyCode == "JPY") {
			if (isMonthly()) {
				$("#monthlyAmountSelections").unhide();
				$("#onetimeAmountSelections").attr("hidden", true);
			} else {
				$("#monthlyAmountSelections").attr("hidden", true);
				$("#onetimeAmountSelections").unhide();
			}
		} else {
			$("#monthlyAmountSelections").attr("hidden", true);
			$("#onetimeAmountSelections").attr("hidden", true);
		}
		
		if (isMonthly()) {
			if (isPayPalSubscriptionsSupported()) {
				$("#paypal").unhide();
			} else {
				$("#paypal").attr("hidden", true);
			}
		} else {
			$("#paypal").unhide();
		}
		
		if (currencyCode == "BTC") {
			if (isEligibleForReducedDonation()) {
				minimumDonation = 0.0005;
			} else {
				minimumDonation = 0.001;
			}
		} else {
			$("paper-button[amount]").each(function() {
				let amount;
				if (currencyCode == "JPY") {
					amount = convertUSDToJPY($(this).attr("amount"));
				} else {
					amount = $(this).attr("amount");
				}
				//Polymer.dom($(this)[0]).innerHTML = amount;
				$(this).text(amount);
			});

			if (isEligibleForReducedDonation()) {
				if (currencyCode == "JPY") {
					minimumDonation = 50;
				} else {
					minimumDonation = 0.50;
				}
			} else {
				if (currencyCode == "JPY") {
					minimumDonation = 100;
				} else {			
					minimumDonation = 1;
				}
			}
		}
	}
}
	
function initPaymentDetails(buttonClicked) {
	donateButtonClicked = buttonClicked;
	
	$("#multipleUserLicenseIntro").slideUp();

	if (ITEM_ID == "screenshots" && !email && isMonthly()) {
		email = prompt("Enter your email to link the other extensions");
		if (!email) {
			niceAlert("You must enter an email");
			return;
		}
	}

	if (licenseType == "singleUser") {
		initPaymentProcessor(amount);
	} else {
		initPaymentProcessor(licenseSelected.price);
	}
}

function isZeroDecimalCurrency(currencyCode) {
	var zeroDecimalCurrencies = ["bif", "djf", "jpy", "krw", "pyg", "vnd", "xaf", "xpf", "clp", "gnf", "kmf", "mga", "rwf", "vuv", "xof"];
	if (zeroDecimalCurrencies.indexOf(currencyCode.toLowerCase()) != -1) {
		return true;
	}
}

function getAmountNumberOnly() {
	var amount = $("#amount").val();
	amount = amount.replace(",", ".");
	amount = amount.replace("$", "");

	if (amount.indexOf(".") == 0) {
		amount = "0" + amount;
	}
	
	// make sure 2 decimal positions ie. 0.5 > 0.50
	if (/\..$/.test(amount)) {
		amount += "0";
	}
	
	amount = $.trim(amount);
	return amount;
}

function hideBeforeSuccessfulPayment() {
	$("#extraFeatures").hide();
	$("#paymentArea").hide();
}

function showSuccessfulPayment() {
	Controller.processFeatures();
	hideBeforeSuccessfulPayment();

	if (DetectClient.isFirefox()) {
		$("#video").attr("src", "contributeVideo.html");
		$('#video').on("load", function () {
			$(this).contents().find("body").off().on('click', () => {
				chrome.tabs.create({ url: "https://www.youtube.com/watch?v=Ue-li7gl3LM" });
			});
		});
	} else {
		$("#video").attr("src", "https://www.youtube.com/embed/Ue-li7gl3LM?rel=0&autoplay=1&showinfo=0&theme=light");
		//$("#video").attr("src", "https://player.vimeo.com/video/207059726?title=false&byline=false&portrait=false&autoplay=true");
	}

	$("#extraFeaturesWrapper").show();
	
	if (localStorage._amountType == "monthly") {
		$("#unlockOtherExtensions").unhide();
	}
	$("#paymentComplete").unhide();
}

function initPaymentProcessor(price) {
	if (donateButtonClicked == "paypal") {
		sendGA("paypal", 'start');
		
		showLoading();

		var donationPageUrl = location.protocol + "//" + location.hostname + location.pathname;

		// seems description is not used - if item name is entered, but i put it anyways
		var data = {
			itemId:			ITEM_ID,
			itemName:		extensionName,
			currency:		getCurrencyCode(),
			price:			price,
			description:	extensionName,
			successUrl:		donationPageUrl + "?action=paypalSuccess",
			errorUrl:		donationPageUrl + "?action=paypalError",
			cancelUrl:		"https://apps.jasonsavard.com/tools/redirectToExtension.php?url=" + encodeURIComponent(donationPageUrl)
		};

		if (email) {
			data.email = email;
		}
		
		if (licenseType == "multipleUsers") {
			data.license = licenseSelected.number;
			data.action = "recurring";
		} else if (isMonthly()) {
			data.action = "recurring";
		}
		
		ajax({
			type: "post",
			url: Controller.FULLPATH_TO_PAYMENT_FOLDERS + "paymentSystems/paypal/createPayment.php",
			data: data,
			timeout: seconds(10)
		}).then((data, textStatus, jqXHR) => {
			location.href = data;
		}).catch(error => {
			hideLoading();
			console.error("error", error);
			openGenericDialog({
				title: getMessage("theresAProblem") + " - " + error.statusText,
				content: getMessage("tryAgainLater") + " " + getMessage("or") + " " + "try Stripe instead."
			});
			sendGA("paypal", 'failure on createPayment');
		});
	} else if (donateButtonClicked == "stripe") {
		sendGA("stripe", 'start');
		
		var stripeCurrency = getCurrencyCode();
		var stripeAmount;

		if (isZeroDecimalCurrency(stripeCurrency)) {
			stripeAmount = price;
		} else {
			stripeAmount = price * 100;
		}

		stripeAmount = Math.round(stripeAmount) // round to prevent invalid integer error ie. when entering amount 1.1
		
		var stripeHandler = StripeCheckout.configure({
			//key: "pk_test_sxqkM56RlF9eGBI3X9cF8KR2", // test
			key: "pk_live_GYOxYcszcmgEMwflDGxnRL6e", // live
		    image: "https://jasonsavard.com/images/jason.png",
		    locale: 'auto',
		    token: function(response) {
		        console.log("token result:", response);
		        
				var data = {
					stripeToken:	response.id,
					amount:			stripeAmount,
					currency:		stripeCurrency,
					price:			price,
					itemId:			ITEM_ID,
					itemName:		extensionName,
					description:	extensionName
				};

				if (response.email) {
					data.email = response.email;
				}

				if (licenseType == "multipleUsers") {
					data.license = licenseSelected.number;
					data.action = "recurring";
				} else if (isMonthly()) {
					data.action = "recurring";
				}
		        
				ajax({
					type: "POST",
					url: "https://apps.jasonsavard.com/paymentSystems/stripe/charge.php",
					data: data
				}).then((data, textStatus, jqXHR) => {
					hideLoading();
					showSuccessfulPayment();
					sendStats("stripe");
				}).catch(jqXHR => {
					hideLoading();
					openGenericDialog({
						title: getMessage("theresAProblem") + " - " + jqXHR.responseText,
						content: getMessage("tryAgainLater") + " " + getMessage("or") + " " + "try PayPal instead."
					});
					sendGA("stripe", 'error with token: ' + jqXHR.responseText);
				});
	      	}
		});
		
		var params = {
			email:		 email,
        	address:     false,
        	amount:      stripeAmount,
        	name:        extensionName,
        	currency:    stripeCurrency,
        	allowRememberMe: false,
        	bitcoin:	 true,
        	alipay:		 false,
        	opened: function() {
        		hideLoading();
        	}
      	};
		
		if (isMonthly()) {
			params.panelLabel = "{{amount}} / " + getMessage("month");
		}
		
		showLoading();
		stripeHandler.open(params);

	} else if (donateButtonClicked == "coinbase") {
		sendGA("coinbase", 'start');
		
		var licenseParamValue = "";
		if (licenseType == "multipleUsers") {
			licenseParamValue = licenseSelected.number;
		}

		var donationPageUrl = location.protocol + "//" + location.hostname + location.pathname;
		
		var data = {
			action: "createCoinbaseIFrame",
			name: extensionName,
			price: price,
			currency: getCurrencyCode(),
			successUrl: "https://apps.jasonsavard.com/tools/redirectToExtension.php?url=" + encodeURIComponent(donationPageUrl + "?action=coinbaseSuccess"),
			cancelUrl: "https://apps.jasonsavard.com/tools/redirectToExtension.php?url=" + encodeURIComponent(donationPageUrl),
			itemID: ITEM_ID
		}

		if (window.email) {
			data.email = window.email;
		}
		if (licenseParamValue) {
			data.license = licenseParamValue;
		}
			
		showLoading();
		ajax({type:"post", url:"https://apps.jasonsavard.com/paymentSystems/coinbase/ajax.php", data:data}).then(response => {
			location.href = response.url;
		}).catch(error => {
			hideLoading();
			console.error(error);
			if (error.error) {
				error = error.error;
			}
			openGenericDialog({
				title: getMessage("theresAProblem"),
				content: getMessage("tryAgainLater") + " " + getMessage("or") + " " + "try PayPal instead."
			});
			sendGA("coinbase", 'error with createCoinbaseIFrame');
		});
	} else {
		openGenericDialog({
			title: getMessage("theresAProblem"),
			content: 'invalid payment process'
		});
	}
}

function ensureEmail(closeWindow) {
	if (!email) {
		openGenericDialog({
			content: getMessage("mustSignInToPay")
		}).then(function() {
			if (closeWindow) {
				window.close();
			}
		});
	}
}

function signOut() {
	location.href = Urls.SignOut;
}

function canHaveALicense(email) {
	return isDomainEmail(email) || getUrlValue(location.href, "testlicense");
}


function isPayPalSubscriptionsSupported() {
	function isInThisLang(lang) {
		return Settings.read("language").indexOf(lang) != -1 || chrome.i18n.getUILanguage().indexOf(lang) != -1;
	}
	
	if (isInThisLang("de") || isInThisLang("zh")) {
		return false;
	} else {
		return true;
	}
}

function isStripeSupported() {
	if (DetectClient.isFirefox()) {
		return false;
	} else {
		return true;
	}
}

if (!DetectClient.isFirefox()) {
	insertScript("https://checkout.stripe.com/checkout.js");
} else {
	$(document).ready(() => {
		$("#stripe").hide();
	});
}

function isMonthly() {
	return $("#paymentType")[0].selected == "monthly";
}

function showAmountSelections() {
	$("#multipleUserLicenseIntro").hide();
	$("#donateAmountWrapper").slideDown();
	$("#paymentMethods").slideUp();
}

function sendStats(paymentProcessor) {
	if (localStorage._amountSubmitted) {
		sendGA(paymentProcessor, "success", localStorage._amountType == "monthly" ? "monthlyAmount": "amount", localStorage._amountSubmitted);

		sendGA("ABTest", "video " + localStorage._abtestvideo, localStorage._amountSubmitted, localStorage._amountSubmitted);

		/*
		if (localStorage._amountType == "monthly") {
			if (localStorage._minMonthlyPayscale) {
				sendGA("ABTest2", "minMonthlyPayscale " + localStorage._minMonthlyPayscale, localStorage._amountSubmitted, localStorage._amountSubmitted);
			}
		} else {
			if (localStorage._minOnetimePayscale) {
				sendGA("ABTest2", "minOnetimePayscale " + localStorage._minOnetimePayscale, localStorage._amountSubmitted, localStorage._amountSubmitted);
			}
		}
		*/
	}
	sendGA(paymentProcessor, "success", "daysElapsedSinceFirstInstalled", daysElapsedSinceFirstInstalled());

}

if (!DetectClient.isFirefox()) {
// jason: needs to be set outside before dom is loaded
var tag = document.createElement('script');
tag.id = 'iframe-demo';
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('video', {
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) {
	// nothing
}

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING) {
		if (!window.sendPlayStatus) {
			sendGA("contributeVideo", "play");
			window.sendPlayStatus = true;
		}
	}
}
}

function getCurrencyCode() {
	return $("#currency")[0].selected;
}

function amountSelected(amount) {
	if (isSimilarValueToUS(getCurrencyCode())) {
		localStorage._amountSubmitted = amount;
		if (isMonthly()) {
			localStorage._amountType = "monthly";
		} else {
			localStorage._amountType = "onetime";
		}
		sendGA("donationAmount", isMonthly() ? 'monthlySubmitted' : 'submitted', amount);
	}
	
	if (amount == "") {
		showError(getMessage("enterAnAmount"));
		$("#amount").focus();
	} else if (parseFloat(amount) < minimumDonation) {
		var minAmountFormatted = minimumDonation;
		showError(getMessage("minimumAmount", $("#currency")[0].selectedItem.getAttribute("symbol") + " " + minAmountFormatted));
		$("#amount").val(minAmountFormatted).focus();
	} else {
		$("#paymentMethods").slideDown();
		$("#multipleUserLicenseIntro").hide();
	}
}

function convertUSDToJPY(amountInUSD) {
	return amountInUSD * 100;
}

$(document).ready(() => {
	
	$("title, .titleLink").text(extensionName);
	
	$("#multipleUserLicenseWrapper").slideUp();

	if (DetectClient.isFirefox()) {
		$("#video").attr("src", "contributeVideo.html");
		$('#video').on("load", function () {
			$(this).contents().find("body").on('click', () => {
				chrome.tabs.create({ url: "https://www.youtube.com/watch?v=fKNZRkhC3OE" });
			});
		});
	} else {

		if (!localStorage._abtestvideo) {
			if (Math.random() < 0.5) {
				localStorage._abtestvideo = "corporate";
			} else {
				localStorage._abtestvideo = "blooper";
			}
		}

		let videoId = localStorage._abtestvideo == "corporate" ? "fKNZRkhC3OE" : "pN9aec4QjRQ";
		$("#video").attr("src", "https://www.youtube.com/embed/" + videoId + "?showinfo=0&theme=light&enablejsapi=1");
	}

	var accountsWithoutErrors = getAccountsWithoutErrors(bg.accounts);
	email = getFirstActiveEmail( accountsWithoutErrors );
	ensureEmail(true);

	initCurrencyAndMinimums(getMessage("currencyCode"));

	if (!isPayPalSubscriptionsSupported() && !isStripeSupported()) {
		$("#paymentTypeWrapper").hide();
		showAmountSelections();
		$("#donateAmountWrapper").show();
	}
	
	if (canHaveALicense(email) && (isPayPalSubscriptionsSupported() || isStripeSupported())) {
		$("#paymentTypeWrapper").hide();
	
		$("#singleUserButton")
			.unhide()
			.click(function() {
		$("#singleUserButton").slideUp();
				$("#paymentTypeWrapper").slideDown();
			})
		;
		
		$("#multipleUserLicenseLink").hide();
		$("#multipleUserLicenseFor").text( getMessage("multipleUserLicenseFor", email.split("@")[1]) );
		$("#multipleUserLicenseButtonWrapper").show();
	} else {
		/*
		var randomNumber = Math.floor(Math.random() * 2) + 1;
		if (randomNumber == 1) { // Math.random() < 0.5
			localStorage._minOnetimePayscale = "10-20-40-60";
		} else if (randomNumber == 2) {
			localStorage._minOnetimePayscale = "10-15-20-40";
			$("#onetimeAmountSelections [amount='60']").attr("hidden", true);
			$("#onetimeAmountSelections [amount='15']").unhide();
		}
		*/
	}
	
	var action = getUrlValue(location.href, "action");
	
	if (action == "paypalSuccess") {
		hideBeforeSuccessfulPayment();
			
		showLoading();
		Controller.verifyPayment(ITEM_ID, email).then(response => {
			hideLoading();
			if (response.unlocked) {
				showSuccessfulPayment();
				sendStats("paypal");
			} else {
				openGenericDialog({
					title: getMessage("theresAProblem"),
					content: "Could not match your email, please <a href='https://jasonsavard.com/contact'>contact</a> the developer!"
				});
			}
		}).catch(error => {
			hideLoading();
			// show success anyways because they might just have extensions preventing access to my server
			showSuccessfulPayment();
				sendGA("paypal", 'failure ' + error + ' but show success anyways');
		});
	} else if (action == "paypalError") {
		var error = getUrlValue(location.href, "error");
		if (!error) {
			error = "";
		}
		
		openGenericDialog({
			title: getMessage("theresAProblem") + " " + error,
			content: getMessage("failureWithPayPalPurchase", "Stripe")
		});
		
		sendGA("paypal", 'failure ' + error);
		} else if (action == "coinbaseSuccess") {
			showSuccessfulPayment();
	} else {
		// nothing
	}
	
	
	var contributionType = getUrlValue(location.href, "contributionType");
	
	if (contributionType == "monthly") {
		// nothing
	}
	
	$("#paymentType").on("paper-radio-group-changed", function() {
		initCurrencyAndMinimums(getCurrencyCode());
		
		if (window.matchMedia && window.matchMedia("(min-height: 800px)").matches) {
			showAmountSelections();
		} else {
			$("#multipleUserLicenseIntro").hide();
			$("#extraFeaturesWrapper").slideUp("slow");
			setTimeout(() => {
				showAmountSelections();
			}, 200);
		}
		sendGA("paymentTypeClicked", this.selected);
	});
	
	$("#currency").on("iron-activate", function(e) {
		var currencyCode = e.originalEvent.detail.selected;
		
		initCurrencyAndMinimums(currencyCode);
		
		if (!isSimilarValueToUS(currencyCode) && currencyCode != "JPY") {
			setTimeout(function() {
				$("#amount")
					.removeAttr("placeholder")
					.focus()
				;
			}, 100)
		}
	});
	
	$("#paypal").click(function() {
		initPaymentDetails("paypal");
		sendGA("paymentProcessorClicked", "paypal");
	});
	
	$("#stripe").click(function() {
		initPaymentDetails("stripe");
		sendGA("paymentProcessorClicked", "stripe");
	});

	$("#coinbase").click(function() {
		if (isMonthly()) {
			niceAlert("The Bitcoin option doesn't support monthly payments, please try PayPal instead or use the one-time option.");
		} else {
		initPaymentDetails("coinbase");
		sendGA("paymentProcessorClicked", "coinbase");
		}
	});

	$(".amountSelections paper-button").click(function() {
		amount = $(this).attr("amount");
		if (getCurrencyCode() == "JPY") {
			amount = convertUSDToJPY(amount);
		}
		
		amountSelected(amount)
	});

	$("#submitDonationAmount").click(function() {
		amount = getAmountNumberOnly();
		amountSelected(amount);
	});

	$('#amount')
		.click(function(event) {
			$(this).removeAttr("placeholder");
			$("#paymentMethods").slideUp();
		})
		.keypress(function(event) {
			if (event.keyCode == '13') {
				$("#submitDonationAmount").click();
			} else {
				$("#submitDonationAmount").addClass("visible");
			}
		})
	;
	
	$("#alreadyDonated").click(function() {
		var $alreadyDonated = $(this);
		if (email) {
			showLoading();
			Controller.verifyPayment(ITEM_ID, email).then(response => {
				hideLoading();
				if (response.unlocked) {
					showSuccessfulPayment();
				} else {
					var $dialog = initTemplate("noPaymentFoundDialogTemplate");
					$dialog.find("#noPaymentEmail").text(email);
					openDialog($dialog).then(function(response) {
						if (response == "ok") {
							
						}
					});
				}
			}).catch(error => {
				hideLoading();
				openGenericDialog({
					title: getMessage("theresAProblem"),
					content: getMessage("tryAgainLater")
				});
			});
		} else {
			ensureEmail();
		}
	});
	
	$("#help").click(function() {
		location.href = "https://jasonsavard.com/wiki/Extra_features_and_donations";
	});
	
	$("#multipleUserLicenseLink, #multipleUserLicenseButton").click(function(e) {
		$("#multipleUserLicenseIntro").slideUp();
		$('#donateAmountWrapper').slideUp();
		if (email) {
			$("#licenseDomain").text("@" + email.split("@")[1]);
			if (canHaveALicense(email)) {
				$("#singleUserButton").slideUp();
				$("#paymentTypeWrapper").slideUp();
				$("#paymentMethods").slideUp();
				
				$("#licenseOptions paper-item").each(function() {
					var users = $(this).attr("users");
					var price = $(this).attr("price");
					
					var userText;
					var priceText;
					
					if (users == 1) {
						userText = getMessage("Xuser", 1);
						priceText = getMessage("anyAmount");
					} else if (users == "other") {
						// do nothing
					} else {
						if (users == "unlimited") {
							userText = getMessage("Xusers", getMessage("unlimited"));
						} else {
							userText = getMessage("Xusers", users);
						}
						priceText = "$" + price + "/" + getMessage("month").toLowerCase();
					}
					
					if (userText) {
						$(this).find("div").eq(0).text( userText );
						$(this).find("div").eq(1).text( priceText );
					}
					
					$(this).off().click(function(e) {
						sendGA("license", users + "");
						if (users == 1) {
							$("#paymentTypeWrapper").slideDown();
							$("#paymentMethods").slideUp();
							$("#multipleUserLicenseLink").hide();
							$("#multipleUserLicenseIntro").slideDown();
							$("#multipleUserLicenseWrapper").slideUp();
						} else if (users == "other") {
							location.href = "https://jasonsavard.com/contact?ref=otherLicense";
						} else {
							if (e.ctrlKey) {
								price = 0.01;
							}
							licenseSelected = {number:users, price:price};

							$("#paymentType")[0].selected = "monthly";
							licenseType = "multipleUsers";
							if (isPayPalSubscriptionsSupported()) {
								initPaymentDetails("paypal");
							} else {
								initPaymentDetails("stripe");
							}
						}
					});
				});
			} else {
				$("#licenseOnlyValidFor").hide();
				$("#signInAsUserOfOrg").show();
				$("#licenseOptions").hide();
				
				$("#exampleEmail").empty().append( $("<span>").text(email.split("@")[0]), $("<b>").text("@mycompany.com") );
			}
			$("#multipleUserLicenseWrapper").slideDown();
		} else {
			ensureEmail();
		}
		
		sendGA("license", "start");
	});
	
	$("#changeDomain").click(function() {
		openGenericDialog({
			content: getMessage("changeThisDomain", getMessage("changeThisDomain2")),
			otherLabel: getMessage("changeThisDomain2")
		}).then(function(response) {
			if (response == "other") {
				signOut();
			}
		});
	});
	
	$("#options").click(function() {
		location.href = "options.html";
	});
	
	$(".signOutAndSignIn").click(function() {
		signOut();
	});
	
	$("#driveExtraFeatures").click(function() {
		chrome.tabs.create({url:"https://jasonsavard.com/Checker-Plus-for-Google-Drive?ref=contributePage"});
	});

	$("#gmailExtraFeatures").click(function() {
		chrome.tabs.create({url:"https://jasonsavard.com/Checker-Plus-for-Gmail?ref=contributePage"});
	});

	$("#calendarExtraFeatures").click(function() {
		chrome.tabs.create({url:"https://jasonsavard.com/Checker-Plus-for-Google-Calendar?ref=contributePage"});
	});
	
	// load these things at the end
	
	// prevent jumping due to anchor # and because we can't javascript:; or else content security errors appear
	$("a[href='#']").on("click", function(e) {
		e.preventDefault()
	});

	$(window).on('message', function(messageEvent) {
		console.log("message", messageEvent);
		var origin = messageEvent.originalEvent.origin;
		var data = messageEvent.originalEvent.data;
		
		if (origin == "https://checkout.stripe.com") {
			try {
				data = JSON.parse(data);
				// data.methods returned are setToken followed by closed
				if (data.method == "setToken") {
					showLoading();
				}
			} catch(error) {
				console.error("could not parse stripe response data: " + error);
			}
		} else if (origin && /https:\/\/(www\.)?coinbase.com/.test(origin)) {
			console.log(origin, data);
		    var eventType = data.split('|')[0];     // "coinbase_payment_complete"
		    var eventId   = data.split('|')[1];     // ID for this payment type

		    if (eventType == 'coinbase_payment_complete') {
		    	setTimeout(function() {
		    		$("#coinbaseWrapper").css("top", "580px");
		    		showSuccessfulPayment();
		    	}, 500);
		    	sendStats("coinbase");
		    } else if (eventType == 'coinbase_payment_mispaid') {
				openGenericDialog({
					title: "Mispaid amount!",
					content: getMessage("tryAgain")
				});
		    } else if (eventType == 'coinbase_payment_expired') {
				openGenericDialog({
					title: "Time expired!",
					content: getMessage("tryAgain")
				});
		    } else {
		        // Do something else, or ignore
		    	console.log("coinbase message: " + eventType);
		    }
	    }
	});

});