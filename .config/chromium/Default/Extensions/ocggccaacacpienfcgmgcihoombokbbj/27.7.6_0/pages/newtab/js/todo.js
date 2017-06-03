/**
 * New tab page TodoList
 */

var windowHeight, windowWidth, todoShowTimer, loadedToDoResponse;

/**
 * Display to do link
 *
 * @param response Object
 */
function displayTodoLink(response) { 
    loadedToDoResponse = response;
    
    if(response && response.displayDials)
        addPageDialsNoticeCloseHandler(response);
    if(response.displayTodoDialPanel) {
        var $todoLink = $("#todo-link");
        var $todoCounter = $("#todo-link-done-counter");
        if(!$todoLink.is(":visible")) {
            toggleHeaderLinksColor((typeof (response.image) != "undefined" && response.image) ||
                (typeof (response.video) != "undefined" && response.video));
            $todoLink.show().css("display","inline-block");
            displayTodoContainer(response);
        }
    }
}

/**
 * Display to do container
 *
 * @param response Object
 */
function displayTodoContainer(response) { 
    if(response.displayTodoDialPanel) {
        var $todoContainer = $("#todo-container");
        windowHeight = parseInt($(window).height());
        windowWidth = parseInt($(window).width());

        var containerHeight = parseInt(response.displayTodoSize.height);
        var containerWidth = parseInt(response.displayTodoSize.width);
        if(typeof (response.displayTodoCoordinates) != "undefined") {
            var displayTop, displayLeft;
            var defaultPopupMargin = 25;

            if(!response.displayTodoCoordinates) {
                displayTop = windowHeight - parseInt(response.displayTodoSize.height) - 209;
                displayLeft = defaultPopupMargin;
            } else {
                displayTop = parseInt(response.displayTodoCoordinates.top);
                displayLeft =  parseInt(response.displayTodoCoordinates.left);
            }

            if(((displayLeft + containerWidth) > windowWidth) || (displayLeft < 0) || ((displayTop + containerHeight) > windowHeight) || (displayTop < 0)) {
                displayTop = windowHeight - containerHeight - 209;
                displayLeft = 25;
            }

            $todoContainer.css({"left" : displayLeft + "px", "top" : displayTop + "px"});

            $(window).resize(function() {
                var $todoContainer = $("#todo-container");
                if($todoContainer.is(":visible")) {
                    //$todoContainer.fadeOut(250, function() {
                        if(todoShowTimer)
                            clearTimeout(todoShowTimer);
                        todoShowTimer = setTimeout(function() {
                            calculateNewTodoPosition();
                        }, 50);
                    //});
                }
            });
        }

        var $todoWork = $(".empty-todo-list, .done-todo-list, .work-todo-list");
        $todoWork.css({
            "min-width" : response.displayTodoSize.width,
            "min-height" : response.displayTodoSize.height,
            "max-width" : response.displayTodoSize.width,
            "max-height" : response.displayTodoSize.height
        });

        readTodoItems(prepareTodoContainerData, response);
        if (response.visibleTodoPanel && windowWidth >= containerWidth && windowHeight > containerHeight) {
            if (!$todoContainer.is(":visible")) {
                setTimeout(function () {
                    $todoContainer.fadeIn(750);
                }, 250);
            }
        } else {
            var $todoCounter = $("#todo-link-done-counter");
            //$todoCounter.css({"display" : "inline-block"});
            $todoCounter.css({"display" : "inline"});
        }
    }
    addPageDialsNoticeCloseHandler(response);
}

/**
 * Calculate new to do position
 */
function calculateNewTodoPosition() { 
    var $todoContainer = $("#todo-container");
    var defaultPopupMargin = 25;

    var coordinates = getDisplayTodoCoordinates();
    windowHeight = parseInt($(window).height());
    windowWidth = parseInt($(window).width());

    var Stoppos = $todoContainer.position();
    var displayLeft = parseInt(Stoppos.left);
    var displayTop = parseInt(Stoppos.top);

    var containerWidth = $todoContainer.width();
    var containerHeight = $todoContainer.height();

    if((displayLeft + containerWidth) >= windowWidth) {
        $todoContainer.css({"left" : windowWidth - containerWidth});
    } else {
        if(coordinates) {
            if(coordinates.left + containerWidth >= windowWidth) {
                $todoContainer.css({"left" : windowWidth - containerWidth});
            } else {
                $todoContainer.css({"left" : coordinates.left});
            }
        }
        else
            $todoContainer.css({"left" : defaultPopupMargin});
    }

    var containerPadding = coordinates ? 0 : 120;
    if(windowHeight - containerHeight - containerPadding >= 0) {
        if((displayTop + containerHeight) + containerPadding >= windowHeight) {
            $todoContainer.css({"top" : windowHeight - containerHeight - containerPadding});
        } else {
            if(coordinates) {
                if(coordinates.top + containerHeight >= windowHeight) {
                    $todoContainer.css({"top" : windowHeight - containerHeight});
                } else {
                    $todoContainer.css({"top" : coordinates.top});
                }
            } else {
                $todoContainer.css({"top" : windowHeight - containerHeight - containerPadding});
            }
        }
    } else {
        $todoContainer.css({"top" : 0});
    }

    if(displayLeft < 0)
        $todoContainer.css({"left" : 0});

    if(displayTop < 0)
        $todoContainer.css({"top" : 0});

    //if(!$todoContainer.is(":visible"))
        //$todoContainer.fadeIn(300);
}

/**
 * Add show hide to do panel click handler
 */
function addShowHideTodoPanelClickHandler() { 
    $("#todo-popup-hide").on("click", hideTodoPopupClickHandler);
    $("#todo-link").on("click", function(e) {
        e.preventDefault();
        var $todoContainer = $("#todo-container");
        var $todoCounter = $("#todo-link-done-counter");
        var isVisible = getVisibleTodoPanel();
        if(isVisible) {
            $todoContainer.fadeOut(250);
            $todoCounter.css({"display": "inline"});
            BRW_sendMessage({command: "changeTodoContainerVisible", "val": !isVisible});
        } else {
            windowHeight = parseInt($(window).height());
            windowWidth = parseInt($(window).width());

            if(windowWidth >= $todoContainer.width() && windowHeight > $todoContainer.height()) {
                calculateNewTodoPosition();
                $todoContainer.fadeIn(250);
                $todoCounter.css({"display" : "none"});
                $("#todo-footer-input").focus();
                BRW_sendMessage({command: "changeTodoContainerVisible", "val": !isVisible});
            }
        }
    });
}

/**
 * Hide to do popup click handler
 */
function hideTodoPopupClickHandler() { 
    var $todoContainer = $("#todo-container");
    var $todoCounter = $("#todo-link-done-counter");
    var isVisible = $todoContainer.is(":visible");
    if(isVisible) {
        $todoContainer.fadeOut(250);
        $todoCounter.css({"display": "inline"});
        BRW_sendMessage({command: "changeTodoContainerVisible", "val": !isVisible});
    }
}

/**
 * Hide to do popup
 */
function hideTodoPopup() { 
    var $todoContainer = $("#todo-container");
    var $todoCounter = $("#todo-link-done-counter");
    var isVisible = $todoContainer.is(":visible");
    if(isVisible) {
        $todoContainer.hide();
        $todoCounter.css({"display": "inline"});
        BRW_sendMessage({command: "changeTodoContainerVisible", "val": !isVisible});
    }
}

/**
 * Read to do items from db
 *
 * @param callback Function
 * @param response Object
 */
function readTodoItems(callback, response) {
    BRW_dbTransaction(function (tx) {
        BRW_dbSelect(
            {//Param
                tx : tx,
                from  :  'TODO_ITEMS',
                order :  'item_order'
            },
            function(results){//Success
                var itemsLength = results.rows.length;
                response.items = [];
                
                for(var i = 0; i < itemsLength; i++) {
                    response.items.push(results.rows[i]);
                }
                
                callback(response);
            },
            function(error){//Error
                console.error("Can't get TODO items (function: readTodoItems)");

            }
        );
    });                
}

/**
 * Prepare to do container data
 *
 * @param response Object
 */
function prepareTodoContainerData(response) { 
    var $itemsContainer = $("#work-todo-list").find("ul").html("");
    if(typeof (response.items) != "undefined" && response.items.length) {
        for(var i in response.items)
            addTodoItemToList(response.items[i], $itemsContainer);
    }

    reCalculateTodoItemsCount();
    if($(".work-todo-list-item").length) {
        $itemsContainer.show();
        $("#work-todo-list").show();
        $("#todo-header-counter").show();
    } else {
        $("#empty-todo-list").show();
    }

    setTodoListOpacity();
    setTodoListOpacityHover();
    
    addTodoListDraggableProperty();
    addTodoListSortableProperty();
    addTodoListResizeProperty();
    
    todoPopupState();
}

function setTodoListOpacityHover(force){
    $(".todo-container-content").on("mouseover", function(){
        setTodoListOpacity(0.6);
    });
    
    $(".todo-container-content").on("mouseleave", function(){
        setTodoListOpacity();
    });
}
    
function setTodoListOpacity(force){
    var opacity = getTodoPanelOpacity() * 1;
    
    if(force && force > opacity) opacity = force;
    
    $(".todo-container-content").stop().animate({
        "background-color": "rgba(0,0,0,"+opacity+")"
    }, 250);
    $(".todo-header").stop().animate({
        "background-color": "rgba(0,0,0," + Math.min(1, (opacity + 0.2)) + ")"
    }, 250);
}//force

/**
 * Add to do item to list
 *
 * @param item Object
 * @param $itemsContainer jQuery element
 */
function addTodoItemToList(item, $itemsContainer) { 
    var $item = $("<li></li>").addClass("work-todo-list-item");
    var $itemContent = $("<div></div>").addClass("work-todo-list-item-content");
    
    $itemContent.hover(function() {
        var $el = $(this);
        var $remove = $el.find(".work-todo-list-item-remove");
        $remove.show();
    }, function() {
        var $el = $(this);
        var $remove = $el.find(".work-todo-list-item-remove");
        $remove.hide();
    });
    
    var $itemRemove = $("<div></div>").addClass("work-todo-list-item-remove");
    $itemRemove.html("&#10006;");
    $itemRemove.on("click", addRemoveTodoItemClickHandler);
    var $itemLabel = $("<label></label>").addClass("work-todo-list-item-label");
    var $itemCheckbox = $("<input>").attr("type", "checkbox").attr("data-item-id", item.id).addClass("work-todo-list-item-checkbox");
    $itemLabel.append($itemCheckbox);
    var $itemTitle = $("<span></span>").addClass("work-todo-list-item-title");
    $itemTitle.text(item.title);
    $itemTitle.on("dblclick", addChangeTodoItemClickHandler);
    var $itemEdit = $("<input>").attr("type", "text").addClass("work-todo-list-item-edit");
    $itemEdit.val(item.title);
    $itemEdit.on("keyup", function(e) {
        if(e.keyCode == 13)
            addChangeTitleTodoItemClickHandler($(this));
        else if (e.keyCode == 27)
            cancelChangeTitleClickHandler($(this));
    });
    $itemEdit.on("focusout", function() {
        addChangeTitleTodoItemClickHandler($(this));
    });

    if(item.done) {
        $itemCheckbox.attr("checked", "checked");
        $itemTitle.addClass("work-todo-list-item-done");
    }

    $itemContent.append($itemRemove).append($itemLabel).append($itemTitle).append($itemEdit);
    $item.append($itemContent);
    $itemsContainer.append($item);
}

/**
 * Add new to do item submit handler
 */
function addNewTodoItemSubmitHandler() { 
    $(document).on("submit", "#todo-footer-input-form", function(e) {
        e.preventDefault();
        var $el = $(this).find("#todo-footer-input");
        var val = $el.val().trim();
        if(val) {
            $el.val("").focus();
            var $itemsContainer = $("#work-todo-list").find("ul");
            var order = $("#work-todo-list").find(".work-todo-list-item-checkbox").length + 1;
            var item = {"id" : new Date().getTime(), "title" : val, "done" : 0, "order" : order};
            addTodoItemToList(item, $itemsContainer);
            BRW_sendMessage({command: "saveTodoItemDb", "id": item.id,  "title": item.title, "order" : item.order});
            reCalculateTodoItemsCount();
            if($(".work-todo-list-item").length) {
                $("#done-todo-list").hide();
                $("#empty-todo-list").hide();
                $("#todo-header-toggle").hide();
                $("#todo-header-counter").show();
                $("#work-todo-list").show();
            }
        } else {
            $el.focus();
            animateTodoInputError(0, 2, 400);
        }
    });
}

/**
 * Animate to do input error
 *
 * @param iterator
 * @param repeat
 * @param delay
 */
function animateTodoInputError(iterator, repeat, delay) { 
    $(".todo-footer-input-form-left").addClass("input-error");
    setTimeout(function() {
        $(".todo-footer-input-form-left").removeClass("input-error");
        setTimeout(function() {
            if(iterator < repeat)
                animateTodoInputError(++iterator, repeat, delay);
        }, delay);
    }, delay);
}

/**
 * Add to do item checkbox handler
 */
function addTodoItemCheckboxHandler() { 
    $(document).on("change", ".work-todo-list-item-checkbox", function() {
        var $el = $(this);
        var val = parseInt($el.attr("data-item-id"));
        var $title = $el.parent().parent().find(".work-todo-list-item-title");
        var $doneCounter = $("#todo-header-done");
        
        var doneCounterVal = parseInt($doneCounter.text());
            doneCounterVal = isNaN(doneCounterVal) ? 0 : doneCounterVal;
        
        if(!isNaN(val) && val && $title) {
            if(typeof SYNC == "object") SYNC.switchToDo({
                id      : val,
                title   : $title.text()
            });
            
            if($el.is(":checked")) {
                if(!$title.hasClass("work-todo-list-item-done")) {
                    $doneCounter.text(doneCounterVal + 1);
                    $title.addClass("work-todo-list-item-done");
                    BRW_sendMessage({command: "changeTodoItemDoneDb", "id": val,  "done": 1});
                }
            } else {
                if($title.hasClass("work-todo-list-item-done")) {
                    $doneCounter.text(doneCounterVal - 1);
                    $title.removeClass("work-todo-list-item-done");
                    BRW_sendMessage({command: "changeTodoItemDoneDb", "id": val,  "done": 0});
                }
            }
        }
        
        reCalculateTodoItemsCount();
        todoPopupState();
    });
}

function todoPopupState(mode){
    if(typeof mode == "undefined" || !mode) mode = false;
    
    var $totalItems = $(".work-todo-list-item").length;
    var $totalDoneItems = $(".work-todo-list-item-done").length;
            
    if(!$totalItems) {
        $("#work-todo-list").hide();
        $("#empty-todo-list").show();
        $("#todo-header-counter").hide();
    }else if($totalItems == $totalDoneItems) {
        if(mode != "no-all-done"){
            $("#empty-todo-list").hide();
            $("#todo-footer-input").focus();
            $("#work-todo-list").hide();
            $("#done-todo-list").show();
            $("#todo-header-toggle").show();
        }//if
    }else{
        $("#empty-todo-list").hide();
        $("#done-todo-list").hide();
        $("#work-todo-list").show();
    }
    
    reCalculateTodoItemsCount();
}//function

/**
 * Add completed today click handler
 */
function addCompletedTodayClickHandler() { 
    $(document).on("click", "#todo-header-toggle", function() {
        var $el = $(this);
        $el.hide();
        $("#done-todo-list").hide();
        $("#empty-todo-list").hide();
        $("#work-todo-list").show();
        $("#todo-footer-input").focus();
    });
}

/**
 * Add remove to do item click handler
 */
function addRemoveTodoItemClickHandler(e) { 
    var $el = $(this).off("click", addRemoveTodoItemClickHandler);
    var $item = $el.parent().parent();
    var val = parseInt($item.find(".work-todo-list-item-checkbox").attr("data-item-id"));
    var txt = $item.find(".work-todo-list-item-title").text();
    if(!isNaN(val) && val) {
        if(typeof SYNC == "object") SYNC.deleteToDo({id:val, title:txt});
        
        BRW_sendMessage({command: "deleteTodoItemDb", "id": val});
        
        $item.fadeOut(100, function() {
            $item.remove();
            
            reCalculateTodoItemsCount();
            $("#todo-footer-input").focus();
            
            //todoPopupState("no-all-done");
            todoPopupState();
            
        });
    }
}

/**
 * Add change to do item click handler
 */
function addChangeTodoItemClickHandler(e) { 
    var $el = $(this);
    var $input = $el.parent().find(".work-todo-list-item-edit");
        $el.hide();
        $input.show();
        $input.focus();
}

/**
 * Add change title to do item click handler
 *
 * @param $el jQuery element
 */
function addChangeTitleTodoItemClickHandler($el) { 
    var title = $el.val().trim();
    var $item = $el.parent().parent();
    var $title = $item.find(".work-todo-list-item-title");
    var id = parseInt($item.find(".work-todo-list-item-checkbox").attr("data-item-id"));
    
    //if(typeof SYNC == "object") SYNC.deleteToDo({id:id, title:$title.text()});
    
    if(title && id) {
        BRW_sendMessage({command: "changeTodoItemTitleDb", "id": id,  "title": title});
        $title.text(title);
        $el.hide();
        $title.show();
        $("#todo-footer-input").focus();
    } else {
        $el.focus();
    }
}

/**
 * Add cancel title to do item click handler
 *
 * @param $el jQuery element
 */
function cancelChangeTitleClickHandler($el) { 
    var $title = $el.parent().find(".work-todo-list-item-title");
    $el.hide();
    $title.show();
    $("#todo-footer-input").focus();
}

/**
 * Calculate to do items count
 */
function reCalculateTodoItemsCount() { 
    
    var $totalDoneItems = $(".work-todo-list-item-done").length;
        $("#todo-header-done").text($totalDoneItems);
    var $totalItems = $(".work-todo-list-item").length;
        $("#todo-header-total").text($totalItems);
    var $notDoneItems = $totalItems - $totalDoneItems;
    var $counter = $("#todo-link-done-counter");
    if($notDoneItems)
        $counter.text(" (" + $notDoneItems + ")");
    else
        $counter.text("");
    
    //todoPopupState();
}

/**
 * Add to do list sortable
 */
function addTodoListSortableProperty() { 
    $("#work-todo-list").find("ul").sortable({ axis: 'y',
        update: function( event, ui ) {
            var changedItems = [];
            var order = 0;
            $("#work-todo-list").find(".work-todo-list-item-checkbox").each(function() {
                changedItems.push({"id" : $(this).attr("data-item-id"), "order" : ++order});
                /*
                if(typeof SYNC == "object") SYNC.changeToDo({
                    id      : $(this).attr("data-item-id"),
                    title   : $(this).parent().siblings(".work-todo-list-item-title").text()
                });
                */
            });
            BRW_sendMessage({command: "changeTodoItemSort", "items": changedItems});
            $("#todo-footer-input").focus();
        }
    });
}

/**
 * Add to do list draggable
 */
function addTodoListDraggableProperty() {     
    $("#todo-container").draggable({ handle: "#todo-header", containment: "#background-borders", scroll: false, delay:0,
        start: function(event, ui) {
            //console.info("TODO draggable", event);
        },
        stop: function(event, ui) {
            updateTodoListCoordinates($(this));
            $("#todo-footer-input").focus();
        }
    });
}

/**
 * Update to do list coordinates
 *
 * @param $el jQuery element
 */
function updateTodoListCoordinates($el) { 
    var Stoppos = $el.position();
    var left = parseInt(Stoppos.left);
    var top = parseInt(Stoppos.top);
    BRW_sendMessage({command: "changeTodoItemCoordinates", "left": left,  "top": top});
}

/**
 * Add to do list resize property
 */
function addTodoListResizeProperty() { 
    $(".todo-container-content").resizable({containment: "#background-borders",
        maxHeight: parseInt($(window).height() * 0.8) || 550,
        maxWidth: 600,
        minHeight: 283,
        minWidth: 300,
        handles: 'se',
        resize: function( event, ui ) {
            var width =  ui.size.width - 30;
            var height = ui.size.height - 84;
            $(".empty-todo-list, .done-todo-list, .work-todo-list").css({"min-width" : width, "min-height" : height, "max-width" : width, "max-height" : height});
        },
        stop: function( event, ui ) {
            BRW_sendMessage({command: "changeTodoItemSize", "width": ui.size.width - 30,  "height": ui.size.height - 84});
            updateTodoListCoordinates($("#todo-container"));
            $("#todo-footer-input").focus();
        }
    });
}

$(function() {
    if(getDisplayTodoDialPanel()) {
        addNewTodoItemSubmitHandler();
        addTodoItemCheckboxHandler();
        addCompletedTodayClickHandler();
        addShowHideTodoPanelClickHandler();
        
        
        addTasksScrollBars();
    }
});

function addTasksScrollBars(){
    $(".work-todo-list").mCustomScrollbar({
        theme:"minimal",
        axis: "y",
        autoHideScrollbar: false,
        
        scrollInertia: 250,
        scrollEasing: "easeOut",

        mouseWheel:{
            enable: true,
            axis: "y",
            normalizeDelta: true,
            scrollAmount: 100,
            deltaFactor: 20
        },

        advanced:{
            updateOnContentResize: true
        },
    });
    
    /*
    $(".done-todo-list").mCustomScrollbar({
        //theme:"minimal",
        axis: "y",
        autoHideScrollbar: false,
        scrollEasing: "linear",

        mouseWheel:{
            enable: true,
            axis: "y",
            normalizeDelta: true,
            scrollAmount: 1000,
            deltaFactor: 20
        },

        advanced:{
            updateOnContentResize: true
        },
    });
    */
}

function todoListUpdate(){
    readTodoItems(prepareTodoContainerData, loadedToDoResponse);
    $("#done-todo-list").hide();
    $("#work-todo-list").hide();

    setTimeout(function () {
        todoPopupState();
    }, 350);
}












