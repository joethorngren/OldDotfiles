var WeatherSuggest = false;

$(function(){
    WeatherSuggest = new ModSuggestions({
        $wrap   : $("#header-weather, #options-settings-weather-location-form"),
        $input  : $("#weather-city, #weather-location"),
        $double : $("#weather-input-city-field"),
        $list   : $("#weather-suggestions-list"),
        $submit : $("#options-settings-weather-location-set"),
        query   : {
            all : {
                url : getAlternativePlaceFinder,
                parser : (RAW)=>{
                    var list = {};
                    if(!RAW || !RAW.query || !RAW.query.results || !RAW.query.results.place) return list;
                    
                    if(!RAW.query.results.place.length && RAW.query.results.place.name) RAW.query.results.place = [RAW.query.results.place];
                    
                    //console.debug(RAW.query.results.place);
                    
                    for(var key in RAW.query.results.place){
                        var val = RAW.query.results.place[key];
                        
                        if(!checkAlternativePlaceIsTown(val)) continue;
                        //console.debug(val);
                        
                        list[val.woeid] = {
                            key : val.woeid,//ok
                            short: val.locality1.content,//ok
                            name : 
                                ''//( val.postal && val.postal.content ? val.postal.content + ', ' : '' )  //ok 
                                + val.locality1.content//ok
                                + ' (' 
                                + (
                                    (val.placeTypeName.code == 12 || val.admin1 == null) ? //Country
                                    (val.placeTypeName.content) :
                                    (val.admin1.content != val.locality1.content ? val.admin1.content : val.placeTypeName.content)
                                  )
                                + ')' 
                                + ', ' + val.country.code//ok
                            ,
                            desc : 
                                ( val.postal && val.postal.content ? val.postal.content + ', ' : '' )  //ok
                                + val.locality1.content//ok
                                + (val.name != val.locality1.content ? ' / ' + val.name : '')
                                + ' (' 
                                + (
                                    (val.placeTypeName.code == 12 || val.admin1 == null) ? //Country
                                    (val.placeTypeName.content) :
                                    (val.admin1.content != val.locality1.content ? val.admin1.content : val.placeTypeName.content)
                                  )
                                + ')' 
                                + ', ' + val.country.content//ok
                                //+ ', ' + val.Region.LocalizedName //no
                            ,
                        };
                        
                    }
                    
                    return list;
                }
            },
            pro : {
                url : getAccuweatherTextSearch,
                parser : (RAW)=>{
                    var list = {};
                    if(!RAW || !RAW.length) return list;
                    
                    for(var key in RAW){
                        var val = RAW[key];
                        
                        list[val.Key] = {
                            key : val.Key,
                            short: val.LocalizedName,
                            name : 
                                ''//( val.PrimaryPostalCode ? val.PrimaryPostalCode + ', ' : '' )                        
                                + val.LocalizedName
                                + ' (' 
                                + (val.AdministrativeArea.LocalizedName != val.LocalizedName ? val.AdministrativeArea.LocalizedName : val.AdministrativeArea.LocalizedType)
                                + ')' 
                                + ', ' + val.Country.ID
                            ,
                            desc : 
                                ( val.PrimaryPostalCode ? val.PrimaryPostalCode + ', ' : '' )
                                + val.LocalizedName
                                + ' (' 
                                + (val.AdministrativeArea.LocalizedName != val.LocalizedName ? val.AdministrativeArea.LocalizedName : val.AdministrativeArea.LocalizedType)
                                + ')' 
                                + ', ' + val.Country.LocalizedName
                                + ', ' + val.Region.LocalizedName
                            ,
                        };
                        //console.debug(val);
                    
                    }
                    
                    
                    
                    return list;
                }
            }
        }
    });
    
});


function ModSuggestions(Data){
    var ts = this;
    
    var ONCE = [], CACHE = {};
    
    var vars = {
        //$wrap : $skin
    };
    
    var API = false;
    
    var UI = {
        $wrap  : Data.$wrap,
        $input : Data.$input,
        $double: Data.$double,
        $list  : Data.$list ,
        $submit: Data.$submit,
    };
    
    var List = {
        raw : false,
        parse : [],
    };
    
    this.state = {
        opened: false,
        query : Data.query,
        param : {
            minLength : 2,
            maxListLength : 15,
        },
        cursor : {
            all : 0,
            cur : 0,
            key : false,
        },
    };
    
    this.text = {
        cur: '',
        last: '',
    };
     
    this.init =()=> {
        if(typeof Data.param == "object"){
            for(var k in Data.param){
                ts.state.param[k] = Data.param[k];
            }
        }
        
        ts.listeners();
    };
    
    this.listeners =()=> {
        UI.$input.on("keydown", function(e) {
            if (e.keyCode === 13) {
                return false;
            }
        });
        
        
        UI.$input.on("keyup", (e)=>{
            //console.debug(e.keyCode);
            
            if([33, 37, 38].indexOf(e.keyCode) != -1) ts.draw("up");
            else
            if([34, 39, 40].indexOf(e.keyCode) != -1) ts.draw("down");
            else
            if(e.keyCode == 13){ // Enter
                if(ts.state.cursor.key){
                    //e.preventDefault(); e.stopPropagation();
                    ts.setPlace();
                }else{
                    ts.draw("hide");
                }
            }
            else
            ts.change();
        });
        
        UI.$list.on("click", "li", (event)=>{
            ts.draw("select", {placeKey: $(event.currentTarget).attr("placeKey")});
            ts.setPlace();
        });
        
        if(UI.$submit.length)
        UI.$submit.on("click", function(e) {
            if(ts.state.cursor.key){
                ts.setPlace();
            }
        });
        
        $(document).on('click', (e)=>{
            if(!UI.$wrap.has(e.target).length){
                ts.draw("hide");
            }
        });
        
    };
    
    this.change =()=> {
        ts.val();
        
        if(ts.text.cur == ts.text.last) return;
        else ts.text.last = ts.text.cur;
        
        //console.debug("UI.$input", ts.val()); 
        
        ts.getList();
    };
    
    this.draw =(actions, mode)=>{
        if(typeof actions != "object") actions = [String(actions)];
        if(typeof mode != "object") mode = {mode: mode || false};
        
        for(var k in actions){
            //console.debug("draw", actions[k]);
            
            switch(actions[k]){
                case "clear":
                    UI.$list
                        .addClass("hide")
                        .find("li").remove()
                    ;
                    
                    ts.state.cursor = {
                        all : 0,
                        cur : false,
                        key : false
                    };
                    
                    ts.text = {
                        cur : '',
                        last: ''
                    }
                break;
                    
                case "hide":
                    UI.$list.fadeOut(150, ()=>{
                        ts.draw("clear");
                    });
                break;
                    
                case "list":
                    if(!Size(List.parse)) return ts.draw("clear");
                    
                    UI.$list
                        .removeClass("hide")
                        .show()
                        .find("li").remove()
                    ;
                    
                    ts.state.cursor.cur = false;
                    ts.state.cursor.key = false;
                    ts.state.cursor.txt = '';
                    
                    var n=0, $ul=[];
                    
                    for(var key in List.parse){
                        var $li = $("<li>");
                        
                        $li
                            .attr("placeKey", key)
                            .attr("title", List.parse[key].desc)
                            .attr("short", List.parse[key].short)
                        ;
                        
                        $li.text(List.parse[key].name);
                        
                        $ul.push($li);
                        
                        if(++n > ts.state.param.maxListLength) break;
                    }
                    
                    ts.state.cursor.all = n;
                    
                    UI.$list.append($ul);
                    
                break;
                    
                case "up":
                case "down":
                    if(!ts.state.cursor.all) return;
                    
                    if(actions[k] == "down"){
                        ts.state.cursor.cur = 1 + (ts.state.cursor.cur || 0);
                        if(ts.state.cursor.cur > ts.state.cursor.all) ts.state.cursor.cur = 1;
                    }else
                    if(actions[k] == "up"){
                        ts.state.cursor.cur = -1 + (ts.state.cursor.cur || 0);
                        if(ts.state.cursor.cur < 1) ts.state.cursor.cur = ts.state.cursor.all;
                    }
                    
                    UI.$list.find("li.active").removeClass("active");
                    
                    var $li = UI.$list.find("li:eq(" + (ts.state.cursor.cur - 1) + ")");
                    
                    $li.addClass("active");
                    
                    ts.state.cursor.key = $li.attr("placeKey");
                    ts.state.cursor.txt = $li.attr("short");//.text();
                    
                    //console.debug(ts.state.cursor);
                break;
                    
                case "select":
                    ts.state.cursor.key = mode.placeKey;
                    
                    UI.$list.find("li.active").removeClass("active");
                    $li = UI.$list.find("li[placeKey='" + mode.placeKey + "']").addClass("active");
                    
                    var n = 0;
                    UI.$list.find("li").each((el, self)=>{
                        //console.debug(el, self);
                        
                        n++;
                        if($(self).attr("placeKey") == mode.placeKey){
                            ts.state.cursor.cur = n;
                            ts.state.cursor.txt = $(self).attr("short");//.text();
                        }
                        
                    });
                                        
                    //console.debug(ts.state.cursor);
                break;
            }
        }
        
        return true;
    };
    
    this.setPlace =()=> {
        if(!ts.state.cursor.cur) return;
        
        //console.debug("setPlace", ts.state.cursor);
        ts.val(ts.state.cursor.txt);
        
        if(typeof confirmClientPlace == "function") confirmClientPlace(UI.$input, ts.state.cursor.key);
        else
        if(typeof confirmClientPlaceSettings == "function") confirmClientPlaceSettings(UI.$input, ts.state.cursor.key);
        
        ts.draw("hide");
    };
    
    this.getList =()=> {
        if(!API) ts.setApi();
        
        if(String(ts.text.cur).length < ts.state.param.minLength){
            ts.draw("clear");
            return;
        }
        
        if(typeof API.url == 'function') var URL = API.url(ts.text.cur);
        else var URL = String(API.url).replace('{query}', encodeURIComponent(ts.text.cur));
        
        //console.debug("getList", URL);
        
        ts.GET({
            url : URL,
            onSuccess : (result, url)=>{
                //console.debug("onSuccess", result, url);
                List.raw = result;
                List.parse = API.parser(result);
                
                //console.debug(List);
                
                ts.draw("list");
            },
            onError : (error)=>{
                console.debug("onError", error);
            }
        });
        
        
    };
    
    this.setApi =()=>{
        if(ts.state.query.pro && AUTH.isPremium()){
            API = ts.state.query.pro;
        }else{
            API = ts.state.query.all;
        }
        
        return API;
    };
    
    this.val =(setValue)=> {
        var value = '';
        
        if(!ts.state.inputType){
            if(
                ['input', 'textarea'].indexOf(UI.$input[0].tagName.toLowerCase()) != -1
            ){
                ts.state.inputType = 'input';
            }else{
                ts.state.inputType = 'html';
            }
        }
        
        if(setValue){
            ts.text.cur = String(setValue).trim();
            
            if(ts.state.inputType == 'input') UI.$input.val(ts.text.cur);
            else
            if(ts.state.inputType == 'html')  UI.$input.html(ts.text.cur);
        }else{
            if(ts.state.inputType == 'input') value = UI.$input.val();
            else
            if(ts.state.inputType == 'html') value = UI.$input.text();

            ts.text.cur = value.trim();
        }
        
        
        return ts.text.cur;
    };
    
    this.GET = function(request){
        var request = request;
        
        if(CACHE[request.url] && request.onSuccess){
            request.onSuccess(CACHE[request.url].result, request.url);
            return;
        }
        
        var xhr = BRW_json(
            request.url,
            function(result){
                CACHE[request.url] = {
                    url : request.url,
                    result : result
                };
                
                if(request.onSuccess) request.onSuccess(result, request.url);
                
                xhr = null;
            },
            function(error){
                if(request.onError) request.onError(error, request.url);
            }
        );
        
        return xhr;
    };
    
    this.init();
};
