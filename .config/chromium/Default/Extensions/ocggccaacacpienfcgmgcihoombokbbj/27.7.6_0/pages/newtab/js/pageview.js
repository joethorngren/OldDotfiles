$(()=>{
    sendToGoogleAnaliticMP(function() {
        gamp('send', 'pageview', '/newtab');
    });
});