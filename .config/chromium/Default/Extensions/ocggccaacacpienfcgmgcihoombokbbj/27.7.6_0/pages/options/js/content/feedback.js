/**
 * Application options feedback
 */

    /**
     * Add feed back link click handler
     */
    function addFeedbackLinkClickButtonHandler() {
        /* Depricated for New Settings
        $(document).on("click", "#feedback-link", function(e) {
            e.preventDefault();
            showFeedBackPopup();
        });
        
        if(window.location.hash && window.location.hash.split('?').shift() == "#contact-us"){
            showFeedBackPopup();
        }//if
        */
        
        $(document).on("click", "#feedBackConfirm", feedBackStartValidation);
        $(document).on("click", "#feedback-close-btn", feedBackClose);

        $(document).on("keyup", "#exampleInputEmail", function(e) {
            var $el = $(this);
            feedBackClearInput($el);
            feedBackEmailValidation($el);
        });

        $(document).on("keyup", "#exampleInputSubject", function(e) {
            var $el = $(this);
            feedBackClearInput($el);
            feedBackSubjectValidation($(this));
        });
    }

    /**
     * Show feed back popup
     */
    function showFeedBackPopup() {
        /* Depricated for New Settings
         $("#feedback-success").hide();
        $("#feedback-form").show();

        var $modal = $("#feedback-dialog");
        $modal.find(".has-error").each(function() {
            $(this).removeClass("has-error");
        });
        $modal.on('hidden.bs.modal', function() {
            feedBackFormClear();
        });
        $modal.modal();
        */
    }

    /**
     * Feed back close handler
     */
    function feedBackClose(e) {
        /* Depricated for New Settings
        var $modal = $("#feedback-dialog");
        $modal.modal('hide');
        */
    }

    /**
     * Feed back start validation
     */
    function feedBackStartValidation(e) {
        e.preventDefault();

        var $form = $("#feedback-form");
        var $isValid = feedBackFormValidation($form);
        if ($isValid)
            feedBackFormSubmit($form);
    }

    function feedBackClearInput($input) {
        var $el = $input.parent();
        if($el.hasClass("has-error"))
            $el.removeClass("has-error");
        if($el.hasClass("has-success"))
            $el.removeClass("has-success");
        $el.find(".form-error-text").text("").hide();
    }

    /**
     * Feedback form submit
     *
     * @param $form jQuery element
     */
    function feedBackFormSubmit($form) {
        $("#feedBackConfirm").off("click", feedBackStartValidation);
        var email = $form.find("#exampleInputEmail").val().trim(),
            subject = $form.find("#exampleInputSubject").val().trim(),
            description = $form.find("#exampleTextArea").val().trim();
        
            getLastLocationWeather(function(locationWeather) {
                description += "\n LSP Version: "+localStorage.getItem("addon-version")+"; ";
                description += "\n Lang: "+localStorage.getItem("definedLocation")+"; ";
                if(locationWeather) description += "\n Weather: "+locationWeather.source+", "+locationWeather.location.city+", "+(locationWeather.location.woeid || locationWeather.location.key);
                if(AUTH) description += "\n Login: "+AUTH.getLogin()+"; "; //getLogin
                description += "\n Theme: "+(localStorage.getItem("background-video-file") || localStorage.getItem("background-image-file"))+"; ";
                
                var feedBackData = {email : email, subject : subject, description : description/*, to_email:"@"*/};

                BRW_post(getFeedBackUrl(), feedBackData, function(data) {
                    $("#feedback-form").slideUp(500, function() {
                        $("#feedback-success").slideDown();
                    });
                });
            });
    }

    /**
     * Feedback form validation
     */
    function feedBackFormClear() {
        var $form = $("#feedback-form");
        var $email = $form.find("#exampleInputEmail").val(''),
            $subject = $form.find("#exampleInputSubject").val(''),
            $description = $form.find("#exampleTextArea").val('');
        feedBackClearInput($email);
        feedBackClearInput($subject);
        feedBackClearInput($description);
    }

    /**
     * Feedback form validation
     *
     * @param $form jQuery element
     * @return Bool
     */
    function feedBackFormValidation($form) {
        var $email = $form.find("#exampleInputEmail"),
            $subject = $form.find("#exampleInputSubject"),
            $description = $form.find("#exampleTextArea");
        $isValidEmail = feedBackEmailValidation($email, true);
        $isValidSubject =  feedBackSubjectValidation($subject, true);
        $isValidDescription = feedBackDescriptionValidation($description, true);
        return $isValidEmail && $isValidSubject && $isValidDescription;
    }

    /**
     * Feedback form email validation
     *
     * @param $email jQuery element
     * @param showError Number
     * @return Bool
     */
    function feedBackEmailValidation($email, showError) {
        var $isValid = true;
        var email = $email.val().trim();
        var $el = $email.parent();
        if(!email) {
            $isValid = false;
            if(showError) {
                if(!$el.hasClass("has-error"))
                    $el.addClass("has-error");
                $el.find(".form-error-text").text(translate("popup_feedback_dialog_field_error_required_email_text")).show();
            }
        } else if(!validateEmail(email)) {
            $isValid = false;
            if(showError) {
                if(!$el.hasClass("has-error"))
                    $el.addClass("has-error");
                $el.find(".form-error-text").text(translate("popup_feedback_dialog_field_error_format_email_text")).show();
            }
        } else {
            if($el.hasClass("has-error"))
                $el.removeClass("has-error");
            if(!$el.hasClass("has-success"))
                $el.addClass("has-success");
            $el.find(".form-error-text").text("").hide();
        }
        return $isValid;
    }

    /**
     * Feedback form subject validation
     *
     * @param $subject jQuery element
     * @param showError Number
     * @return Bool
     */
    function feedBackSubjectValidation($subject, showError) {
        var $isValid = true;
        var subject = $subject.val().trim();
        var $el = $subject.parent();
        if(!subject) {
            $isValid = false;
            if(showError) {
                if(!$el.hasClass("has-error"))
                    $el.addClass("has-error");
                $el.find(".form-error-text").text(translate("popup_feedback_dialog_field_error_required_subject_text")).show();
            }
        } else if(subject.length < 6) {
            $isValid = false;
            if(showError) {
                if(!$el.hasClass("has-error"))
                    $el.addClass("has-error");
                $el.find(".form-error-text").text(translate("popup_feedback_dialog_field_error_too_low_subject_text")).show();
            }
        } else {
            if($el.hasClass("has-error"))
                $el.removeClass("has-error");
            if(!$el.hasClass("has-success"))
                $el.addClass("has-success");
            $el.find(".form-error-text").text("").hide();
        }
        return $isValid;
    }

    /**
     * Feedback form description validation
     *
     * @param $description jQuery element
     * @param showError Number
     * @return Bool
     */
    function feedBackDescriptionValidation($description, showError) {
        var $isValid = true;
        var description = $description.val().trim();
        var $el = $description.parent();
        if(description) {
            if($el.hasClass("has-error"))
                $el.removeClass("has-error");
            if(!$el.hasClass("has-success"))
                $el.addClass("has-success");
            $el.find(".form-error-text").text("").hide();
        }
        return $isValid;
    }