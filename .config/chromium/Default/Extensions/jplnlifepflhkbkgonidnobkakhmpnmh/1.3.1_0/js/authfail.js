/* Private Internet Access(TM) browser extension (v1.3.1) */
!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){"use strict";new function(a,b){var c=this,d=function e(a){var e=b.createElement("link");return e.setAttribute("rel","stylesheet"),e.setAttribute("href","/css/locales/"+a+".css"),e};return b.addEventListener("DOMContentLoaded",function(){var a=b.querySelector("h1#title"),c=b.querySelector("h4#message"),e=chrome.i18n.getUILanguage().slice(0,2);a.innerHTML=chrome.i18n.getMessage("AuthFailTitle"),c.innerHTML=chrome.i18n.getMessage("AuthFailMessage"),b.head.appendChild(d(e))}),c}(window,document)},{}]},{},[1]);