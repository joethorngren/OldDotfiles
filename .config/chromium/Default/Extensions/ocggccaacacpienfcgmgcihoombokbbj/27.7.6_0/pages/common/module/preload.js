if(BROWSER != "firefox"){
    //console.debug('BROWSER != "firefox"', BROWSER);    
    
    localStorage.getItem("install-key");

    //getAppInstalledDate();

    if(
        (
            !localStorage.getItem("install-key") 
            &&
            !localStorage.getItem("installed-key") 
        )
        ||
        (
            !localStorage.getItem("background-video-file")
            &&
            !localStorage.getItem("background-image-file")
            &&
            !localStorage.getItem("background-disabled")
        )
        //|| !localStorage.getItem("tours-shown") 
    ){
        storageBackup();
    }
}
