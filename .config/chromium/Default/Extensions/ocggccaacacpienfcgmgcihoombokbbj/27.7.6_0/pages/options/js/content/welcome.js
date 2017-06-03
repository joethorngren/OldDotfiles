/**
 * Application options welcome
 */

    /**
     * Display welcome settings page always hide status
     */
    function displayWelcomeSettingsPageAlwaysHideStatus() {
        var $el = $("#welcome-options-not-show");
        if(getSettingsWelcomePageAlwaysHideState())
            $el.attr("checked", "checked");

        $el.on("change", function(e) {
            var val = $el.is(':checked');
            BRW_sendMessage({
                command: "setWelcomeSettingsPageAlwaysHideStatus",
                val: val
            });
        });
    }

    /**
     * Display settings welcome page
     */
    function displaySettingsWelcomePage() {
        return false;
        // Depricated in new settings page
        /*
        if(!getSettingsWelcomePageAlwaysHideState()) {
            var pageHasImageBg = localStorage.getItem("background-image-file");
            var pageHasVideoBg = localStorage.getItem("background-video-file");
            if(!getSettingsWelcomePageState() || (!pageHasImageBg && !pageHasVideoBg)) {
                $(document).on("click", "#welcome-options-close", function() {
                    $('#welcome-options-dialog').modal('hide');
                });

                setTimeout(function() {
                    $('#welcome-options-dialog').modal();
                    changeSettingsWelcomePageState();
                }, 1000);
            }
        }
        */
    }