/**
 * Application options welcome
 */

    /**
     * Display settings flixel video button
     */
    function displaySettingsFlixelVideoBtn() {
        var $btn = $("#add-user-flixel-btn");
        if($btn) {
            if(navigator && navigator.userAgent) {
                if(navigator.userAgent.toLocaleLowerCase().indexOf('mac') != -1)
                    $btn.show();
            }
        }
    }