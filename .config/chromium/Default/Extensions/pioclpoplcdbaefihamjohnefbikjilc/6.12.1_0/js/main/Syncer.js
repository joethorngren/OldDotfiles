/*! Copyright 2009-2017 Evernote Corporation. All rights reserved. */

function Syncer(a,b,c,d,e,f,g,h,i){"use strict";function j(a){t.push(a),r(a[e]),l()}function k(){for(var b=0;b<d.length;b++){var c=Persistent.get(d[b].name);c&&delete c[a],Persistent.set(d[b].name,c)}i&&i()}function l(){for(var b={},c=0;c<d.length;c++){var e=d[c].name,f=Persistent.get(e);f||(f={}),f[a]||(f[a]={});for(var g=0;g<t.length;g++){var h=t[g][e];if(h)for(var i=0;i<h.length;i++){for(var j=h[i],k=0;k<d[c].idPropertyChain.length;k++)j=j[d[c].idPropertyChain[k]];if(f[a][j]=d[c].updateItem(f[a][j],h[i]),d[c].extraHandling){var l=d[c].extraHandling(f[a][j],b);for(var m in l)if("item"===m)l.item?f[a][j]=l.item:delete f[a][j];else{var n=Persistent.get(m);n[a]=l[m],Persistent.set(m,n)}}}}b[e]=f[a],Persistent.set(e,f)}t=[],u()}function m(){return b}function n(){var b=Persistent.get(c+"USN");return b&&b[a]&&(!b[a].version||b[a].version<h)&&(delete b[a],Persistent.set(c+"USN",b),k()),b&&b[a]?b[a].usn:0}function o(a){a[e]?(t.push(a),r(a[e]),a[e]<a[f]?s():l()):l()}function p(a){log.log(a)}function q(a){u=a}function r(b){var d=Persistent.get(c+"USN");d||(d={}),d[a]||(d[a]={}),d[a].version=h,d[a].usn=b,Persistent.set(c+"USN",d)}function s(){g(n(),o,p)}var t=[],u=null;this.applySyncChunk=j,this.getAuthToken=m,this.setSyncCompleteHandler=q,this.sync=s,Object.preventExtensions(this)}Object.preventExtensions(Syncer);