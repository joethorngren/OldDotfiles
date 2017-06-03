/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */

function Submitter(a,b,c,d){"use strict";function e(a,b,c,d,e){D.resources||(D.resources=[]);var h=n(a,b),i=f(a.buffer,h,c,d,e);D.resources.push(i),z+=i.data.body.byteLength,b.parentNode.replaceChild(g(a.buffer,h,b),b)}function f(a,b,c,d,e){var f=new Resource;if(f.data=new Data,f.data.body=a,f.mime=b,f.attributes=new ResourceAttributes,f.attributes.sourceURL=GlobalUtils.removeControlCharacters(c),f.attributes.fileName=d,!d&&c){var g=/.+\/(.+?)(?:$|[\?\/])/.exec(c);if(g)try{f.attributes.fileName=decodeURIComponent(g[1])}catch(a){if("URIError"!==a.name)throw a;f.attributes.fileName=unescape(g[1])}}return f.attributes.fileName&&!l(f.attributes.fileName,b)&&(f.attributes.fileName+=m(b)),f.attributes.fileName&&(f.attributes.fileName=GlobalUtils.removeControlCharacters(f.attributes.fileName)),f.attributes.attachment=!!e,f}function g(a,b,c){var d=E.createElement("en-media");d.setAttribute("type",b),d.setAttribute("hash",SparkMD5.ArrayBuffer.hash(a));for(var e=0;e<c.attributes.length;e++){var f=c.attributes[e].name.toLowerCase();H.indexOf(f)>-1&&d.setAttribute(f,c.attributes[e].value)}return d}function h(a,b){return new Promise(function(c,d){var e=new XMLHttpRequest;e.open(a,b,!0),e.onreadystatechange=function(){4===this.readyState&&200===this.status&&c(e)},e.onerror=function(){d({status:this.status,statusText:e.statusText})},e.onloadend=function(){404==e.status&&d({status:e.status,statusText:e.statusText})},e.send()})}function i(b,c,d,e,f,g,i,k,l,m,n){function r(){D.content='<?xml version="1.0" encoding="utf-8"?><!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd"><en-note>',i&&i.trim()&&(D.content+=GlobalUtils.escapeXML(i).replace(/(?:\r\n|\r|\n)/g,"<br/>")+"<hr/>"),D.content+='<div style="-evernote-webclip:true">',D.content+="<br/>"+m+"<br/></div></en-note>";var a=new DOMParser;E=a.parseFromString(GlobalUtils.removeControlCharacters(D.content,!0),"application/xml");for(var h=E.querySelectorAll("img[src], embed[src], div[evernote_attachment_url]"),j=0;j<h.length;j++){var k=h[j],l=k.getAttribute("src")||k.getAttribute("evernote_attachment_url");l&&(F.test(l)?o(F.exec(l)[1],k):G.test(l)?q(n[G.exec(l)[1]-0],k):p(l,k))}D.title=b,D.notebookGuid=c,t=d,u=e,v=f,g&&g.length>0&&(D.tagNames=g),A=!0,s()}D.attributes=new NoteAttributes,D.attributes.source="clearly"===l?"Clearly":"external"===l?"External":"web.clip",D.attributes.sourceURL=GlobalUtils.removeControlCharacters(k),"pdf"!==l?r():h("HEAD",D.attributes.sourceURL).then(function(b){var c=parseInt(b.getResponseHeader("Content-Length")),d=a.noteSizeMax;if(d&&c&&Number.isInteger(c)&&c>d){log.warn("The size of PDF is more than "+d+" bytes.");var e=new EDAMUserException;e.errorCode=EDAMErrorCode.LIMIT_REACHED,e.parameter="Note.size",j(e)}else r()}).catch(function(a){log.error(a),r()})}function j(c){var d;switch(c.name){case"EDAMNotFoundException":"Note.notebookGuid"==c.identifier&&(d="unknownNotebook");break;case"EDAMUserException":switch(c.errorCode){case EDAMErrorCode.BAD_DATA_FORMAT:switch(c.parameter){case"Note.content":d="noteSizeExceeded"}break;case EDAMErrorCode.LIMIT_REACHED:switch(c.parameter){case"Note":d="overAccountMax";break;case"Note.size":case"Note.resources":case"Resource.data.size":d="noteSizeExceeded"}break;case EDAMErrorCode.QUOTA_REACHED:"Accounting.uploadLimit"==c.parameter&&(d="overQuota")}}1!=c.isTrusted&&!1!==navigator.onLine||(d="network",log.error("Network error. URL: "+D.attributes.sourceURL+", notestore: "+a.noteStoreUrl+", exception object: "+JSON.stringify(c))),d||(log.error(D.attributes.sourceURL+", "+a.noteStoreUrl+", "+c.__proto__.name+", "+JSON.stringify(c)),d="unknown");var e={noteSizeExceeded:"Too big",overQuota:"Over quota",overAccountMax:"Over account max",network:"Network"};extension.trackEvent({category:"Errors",action:e[d]||"Thrift: "+JSON.stringify(c).substr(0,200),label:"network"===d?JSON.stringify(c).substr(0,200):D.attributes.sourceURL});var f="unknown"===d?JSON.stringify(c):null;b({name:"fail",error:d,exceptionJSON:f})}function k(c){!function(){var d={name:"success",noteSize:z,noteGuid:c.guid,shardId:a.shardId,notebookName:t,noteStoreUrl:a.noteStoreUrl,noteUserId:a.userId,noShareNotes:u,token:a.token,notebookType:v};!d.notebookName||!0!==d.noShareNotes&&!1!==d.noShareNotes?y.getNotebook(a.token,c.notebookGuid,function(a){d.notebookName=a.name,d.noShareNotes=a.restrictions.noShareNotes,b(d)},function(a){log.error(a.name+" "+JSON.stringify(a)),b(d)}):b(d)}()}function l(a,b){return b===EDAM_MIME_TYPE_JPEG?/\.jpe?g$/.test(a):b===EDAM_MIME_TYPE_PNG?/\.png$/.test(a):b===EDAM_MIME_TYPE_GIF?/\.gif$/.test(a):b===EDAM_MIME_TYPE_PDF?/\.pdf$/.test(a):"image/webp"!==b||/\.webp$/.test(a)}function m(a){return a===EDAM_MIME_TYPE_JPEG?".jpg":a===EDAM_MIME_TYPE_PNG?".png":a===EDAM_MIME_TYPE_GIF?".gif":a===EDAM_MIME_TYPE_PDF?".pdf":"image/webp"===a?".webp":""}function n(a,b){if(b&&b.hasAttribute("evernote_attachment_mime")){var c=b.getAttribute("evernote_attachment_mime");if(c.toLowerCase()!==EDAM_MIME_TYPE_DEFAULT&&new RegExp(EDAM_MIME_REGEX).test(c))return c}if(255===a[0]&&216===a[1]&&255===a[2])return EDAM_MIME_TYPE_JPEG;if(137===a[0]&&80===a[1]&&78===a[2]&&71===a[3]&&13===a[4]&&10===a[5]&&26===a[6]&&10===a[7])return EDAM_MIME_TYPE_PNG;if(0===a[0]&&0===a[1]&&1===a[2]&&0===a[3])return EDAM_MIME_TYPE_PNG;if(71===a[0]&&73===a[1]&&70===a[2]&&56===a[3]&&(55===a[4]||57===a[4])&&97===a[5])return EDAM_MIME_TYPE_GIF;if(37===a[0]&&80===a[1]&&68===a[2]&&70===a[3])return EDAM_MIME_TYPE_PDF;if(82===a[0]&&73===a[1]&&70===a[2]&&70===a[3]&&87===a[8]&&69===a[9]&&66===a[10]&&80===a[11])return"image/webp";if(208===a[0]&&207===a[1]&&17===a[2]&&224===a[3]&&161===a[4]&&177===a[5]&&26===a[6]&&225===a[7]){if(236===a[512]&&165===a[513]&&193===a[514]&&0===a[515])return"application/msword";if(0===a[512]&&110===a[513]&&30===a[514]&&240===a[515]||15===a[512]&&0===a[513]&&232===a[514]&&3===a[515]||160===a[512]&&70===a[513]&&29===a[514]&&240===a[515])return"application/mspowerpoint";if(9===a[512]&&8===a[513]&&16===a[514]&&0===a[515]&&0===a[516]&&6===a[517]&&5===a[518]&&0===a[519]||253===a[512]&&255===a[513]&&255===a[514]&&255===a[515]&&32===a[516]&&0===a[517]&&0===a[518]&&0===a[519])return"application/excel"}else if(80===a[0]&&75===a[1]&&3===a[2]&&4===a[3]){var d=OOXMLReader.getFileType(a);if(d===OOXMLReader.DOCX)return"application/vnd.openxmlformats-officedocument.wordprocessingml.document";if(d===OOXMLReader.PPTX)return"application/vnd.openxmlformats-officedocument.presentationml.presentation";if(d===OOXMLReader.XLSX)return"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}return EDAM_MIME_TYPE_DEFAULT}function o(a,b){try{for(var c=decodeURIComponent(a).split("&")[0],d=window.atob(c),f=new Uint8Array(2*d.length),g=0;g<d.length;g++)f[g]=d.charCodeAt(g);e(f,b)}catch(b){log.warn("Unable to process dataUri, src: "+a.substr(0,50))}}function p(a,b){if(a=GlobalUtils.unescapeXML(a),B++,EDGE&&d&&-1!==d.url.indexOf("mail.google.com"))Browser.sendToTab(d,{name:"getGmailAttachment",url:a},function(c){if(c.success){for(var d=new Uint8Array(c.data.length),f=0;f<c.data.length;f++)d[f]=c.data.charCodeAt(f);b.hasAttribute("evernote_attachment_url")?e(d,b,a,b.getAttribute("evernote_attachment_name"),!0):e(d,b,a)}C++,s()});else{var c=new XMLHttpRequest;c.open("GET",a),c.responseType="arraybuffer",c.onreadystatechange=function(a,b){return function(){4===this.readyState&&(200===this.status&&this.response&&this.response.byteLength>0?b.hasAttribute("evernote_attachment_url")?e(new Uint8Array(this.response),b,a,b.getAttribute("evernote_attachment_name"),!0):e(new Uint8Array(this.response),b,a):("embed"===b.nodeName.toLowerCase()||b.hasAttribute("evernote_attachment_url"))&&r(b),C++,s())}}(a,b);try{c.send()}catch(a){C++,s()}}}function q(a,b){a.bytes.length||(a.bytes.length=a.byteLength),e(new Uint8Array(a.bytes),b,D.attributes.sourceURL)}function r(a){a.parentNode.removeChild(a)}function s(){if(A&&B===C){var d=new XMLSerializer;if(D.content=d.serializeToString(E),D.content=D.content.replace(I,"<$1$2></$1>"),EDGE&&(D.content='<?xml version="1.0" encoding="utf-8"?>'+D.content,D.content=D.content.replace(/xmlns:xml="[^"]+"/g,""),D.content=D.content.replace(/xmlns:xml='[^']+'/g,"")),D.content.length>EDAM_NOTE_CONTENT_LEN_MAX){var e=new EDAMUserException;return e.errorCode=EDAMErrorCode.BAD_DATA_FORMAT,e.parameter="Note.content",void j(e)}if(z+=D.content.length,a.noteSizeMax&&z>a.noteSizeMax){var e=new EDAMUserException;return e.errorCode=EDAMErrorCode.LIMIT_REACHED,e.parameter="Note.size",void j(e)}if(c||b({name:"showSyncing"}),"noteSizeExceeded"===extension.getOption("simulateClippingError")){var e=new EDAMUserException;e.errorCode=EDAMErrorCode.LIMIT_REACHED,e.parameter="Note.size",j(e)}else if("overQuota"===extension.getOption("simulateClippingError")){var e=new EDAMUserException;e.errorCode=EDAMErrorCode.QUOTA_REACHED,e.parameter="Accounting.uploadLimit",j(e)}else if("overAccountMax"===extension.getOption("simulateClippingError")){var e=new EDAMUserException;e.errorCode=EDAMErrorCode.LIMIT_REACHED,e.parameter="Note",j(e)}else y.createNote(a.token,D,k,j)}}var t,u,v,w=new Thrift.BinaryHttpTransport(a.noteStoreUrl),x=new Thrift.BinaryProtocol(w),y=new NoteStoreClient(x),z=0,A=!1,B=0,C=0,D=new Note,E=null,F=/^data:[^,]+,(.+)/i,G=/^resource:(.+)/i,H=["style","title","lang","xml:lang","dir","height","width","usemap","align","border","hspace","vspace","longdesc","alt"],I=/<(?!area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)([\w-]+)([^>]*)\/>/g;this.createNoteWithThrift=i}