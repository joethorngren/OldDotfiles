/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */

function receivePersistentValue(a,b,c){a.key===WSJ_TOOLTIP_FLAG_KEY&&(a.currentUserId||(a.currentUserId="unauthed"),a.value&&a.value[a.currentUserId]||(new TooltipCoordinator(Browser.extension.getURL("content/tooltips/tooltip2.html#which="+WSJ_NAME),WSJ_NAME,"evernoteWSJTooltip",{generatePosition:function(){var a=GlobalUtils.getPositionOfElementRelativeTo(wsjClipButton,document.body);return a.left+=wsjClipButton.offsetWidth+WSJ_TOOLTIP_X_DISTANCE_FROM_BUTTON,a.top-=40-(wsjClipButton.offsetHeight-14)/2,a.fixed=GlobalUtils.getPositionTypeOfElement(wsjClipButton),a},updatePosition:!0,closeOnOutsideClick:!0}),Browser.sendToExtension({name:"setPersistentValueForUser",key:WSJ_TOOLTIP_FLAG_KEY,userId:a.currentUserId,value:!0}))),c&&"function"==typeof c&&c()}if(/(?:^|\.)wsj\.com/i.test(location.hostname)&&window===window.parent){var WSJ_TOOLTIP_FLAG_KEY="sawWSJTooltip",WSJ_NAME="wsj",WSJ_TOOLTIP_X_DISTANCE_FROM_BUTTON=10;Browser.addMessageHandlers({receivePersistentValue:receivePersistentValue});var wsjClipButton=document.getElementsByClassName("evernote-clip-button")[0];wsjClipButton&&Browser.sendToExtension({name:"getPersistentValue",key:WSJ_TOOLTIP_FLAG_KEY})}