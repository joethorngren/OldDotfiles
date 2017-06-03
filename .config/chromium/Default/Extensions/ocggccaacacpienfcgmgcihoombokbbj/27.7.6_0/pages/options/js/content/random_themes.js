/**
 * Application options random themes
 */

    /**
     * Check display random themes is active
     */
    function checkDisplayRandomThemesActive() {
        if(getRandomThemesDisplay()) {
            $.jGrowl(translate("options_random_mode_is_active_notice"), { "life" : 7000 });
        }
    }