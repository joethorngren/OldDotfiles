
function saveShowFormats(options){

    console.log('saveShowFormats');
	
    for (var i in options) 
	{
		console.log(i + "   " + options[i]);
	
	
	}
	
	
}


window.addEventListener( "load", function(){

	try{
		YouTubeSmartPause.Options.init();		
	}
	catch( ex ){

	}
	
	// -------- события на Click
	document.getElementById("applyChangesButton").addEventListener( "click", function( event ){			
		YouTubeSmartPause.Options.applyChanges( saveShowFormats );
	}, false );
	
	document.getElementById("buttonCloseButton").addEventListener( "click", function( event ){			
		YouTubeSmartPause.Options.close();
	}, false );


	document.getElementById("mainMail").addEventListener( "click", function(){		
		YouTubeSmartPause.Options.openGetSatisfactionSuggestions();
	}, false );
	
}, false );

