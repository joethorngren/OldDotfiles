window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
var recognizer;

$(function() {
    if (window.SpeechRecognition) {
        recognizer = new window.SpeechRecognition();
        var $speechSearchContainer = $(".search-speed-container");
        var $transcription = $("#search-input");
        var $placeholder = $("#search-placeholder");
        recognizer.continuous = false;
        recognizer.lang = chrome.i18n.getUILanguage() || "en-US";
        recognizer.maxAlternatives = 1;

        recognizer.onresult = function(event) {
            $transcription.val("");
            for (var i = event.resultIndex; i < event.results.length; i++) {
                var result;
                if (event.results[i].isFinal) {
                    result = event.results[i][0].transcript;
                    if(result) {
                        if ($placeholder.is(":visible"))
                            $placeholder.hide();
                    }
                    $speechSearchContainer.attr("data-speech-progress", 0);
                    stopAnimateSpeechProgress($speechSearchContainer);
                    if(result) {
                        $transcription.val(result);
                        setTimeout(function() {
                            var $searchForm = $("#search-form");
                            $searchForm.submit();
                        }, 500);
                    } else {
                        $transcription.val("");
                        if (!$placeholder.is(":visible"))
                            $placeholder.show();
                    }
                } else {
                    result = $transcription.val() + event.results[i][0].transcript;
                    if(result)
                        $transcription.val(result);
                }
            }
        };

        recognizer.onerror = function(event) {
            $speechSearchContainer.attr("data-speech-progress", 0);
            stopAnimateSpeechProgress($speechSearchContainer);
        };

        recognizer.onend = function(event) {
            $speechSearchContainer.attr("data-speech-progress", 0);
            stopAnimateSpeechProgress($speechSearchContainer);
        };

        $(document).on("click", "#search-speed-container", function(e) {
            e.preventDefault();
            var $el = $(this);
            var progress = parseInt($el.attr("data-speech-progress"));
            if(isNaN(progress) || !progress) {
                try {
                    recognizer.start();
                    $el.attr("data-speech-progress", 1);
                    startAnimateSpeechProgress($speechSearchContainer);
                } catch(event) {
                    $el.attr("data-speech-progress", 0);
                    stopAnimateSpeechProgress($speechSearchContainer);
                }
            } else {
                recognizer.stop();
                $el.attr("data-speech-progress", 0);
                stopAnimateSpeechProgress($speechSearchContainer);
            }

            $transcription.val("");
            if (!$placeholder.is(":visible"))
                $placeholder.show();
        });
    }else{
        $("#search-speed-container").remove();//firefox
    }
});

/**
 * Stop speech recording
 */
function stopSpeechRecording() {
    if(recognizer) {
        var $speechSearchContainer = $("#search-speed-container");
        recognizer.stop();
        $speechSearchContainer.attr("data-speech-progress", 0);
        stopAnimateSpeechProgress($speechSearchContainer);
    }
}

/**
 * Start animate speech progress
 *
 * @param $el jQuery element
 */
function startAnimateSpeechProgress($el) {
    var properties = {"border-color": "#F58F6F"};
    $el.pulse(properties, {pulses : -1, duration: 900});
}

/**
 * Stop animate speech progress
 *
 * @param $el jQuery element
 */
function stopAnimateSpeechProgress($el) {
    $el.pulse('destroy');
}