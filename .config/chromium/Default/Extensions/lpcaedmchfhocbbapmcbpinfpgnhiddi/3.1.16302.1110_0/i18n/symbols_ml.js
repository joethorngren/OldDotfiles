var a=this,b=function(m,k){var f=m.split("."),e=a;f[0]in e||!e.execScript||e.execScript("var "+f[0]);for(var g;f.length&&(g=f.shift());)f.length||void 0===k?e=e[g]?e[g]:e[g]={}:e[g]=k};var c={b:{1E3:{other:"0K"},1E4:{other:"00K"},1E5:{other:"000K"},1E6:{other:"0M"},1E7:{other:"00M"},1E8:{other:"000M"},1E9:{other:"0B"},1E10:{other:"00B"},1E11:{other:"000B"},1E12:{other:"0T"},1E13:{other:"00T"},1E14:{other:"000T"}},a:{1E3:{other:"0 thousand"},1E4:{other:"00 thousand"},1E5:{other:"000 thousand"},1E6:{other:"0 million"},1E7:{other:"00 million"},1E8:{other:"000 million"},1E9:{other:"0 billion"},1E10:{other:"00 billion"},1E11:{other:"000 billion"},1E12:{other:"0 trillion"},1E13:{other:"00 trillion"},
1E14:{other:"000 trillion"}}},c={b:{1E3:{other:"0K"},1E4:{other:"00K"},1E5:{other:"000K"},1E6:{other:"0M"},1E7:{other:"00M"},1E8:{other:"000M"},1E9:{other:"0B"},1E10:{other:"00B"},1E11:{other:"000B"},1E12:{other:"0T"},1E13:{other:"00T"},1E14:{other:"000T"}},a:{1E3:{other:"0 \u0d06\u0d2f\u0d3f\u0d30\u0d02"},1E4:{other:"00 \u0d06\u0d2f\u0d3f\u0d30\u0d02"},1E5:{other:"000 \u0d06\u0d2f\u0d3f\u0d30\u0d02"},1E6:{other:"0 \u0d26\u0d36\u0d32\u0d15\u0d4d\u0d37\u0d02"},1E7:{other:"00 \u0d26\u0d36\u0d32\u0d15\u0d4d\u0d37\u0d02"},
1E8:{other:"000 \u0d26\u0d36\u0d32\u0d15\u0d4d\u0d37\u0d02"},1E9:{other:"0 \u0d32\u0d15\u0d4d\u0d37\u0d02 \u0d15\u0d4b\u0d1f\u0d3f"},1E10:{other:"00 \u0d32\u0d15\u0d4d\u0d37\u0d02 \u0d15\u0d4b\u0d1f\u0d3f"},1E11:{other:"000 \u0d32\u0d15\u0d4d\u0d37\u0d02 \u0d15\u0d4b\u0d1f\u0d3f"},1E12:{other:"0 \u0d1f\u0d4d\u0d30\u0d3f\u0d32\u0d4d\u0d2f\u0d7a"},1E13:{other:"00 \u0d1f\u0d4d\u0d30\u0d3f\u0d32\u0d4d\u0d2f\u0d7a"},1E14:{other:"000 \u0d1f\u0d4d\u0d30\u0d3f\u0d32\u0d4d\u0d2f\u0d7a"}}};var d={I:"y",la:"y G",J:"MMM y",K:"MMMM y",s:"MMM d",u:"MMMM dd",w:"M/d",v:"MMMM d",V:"MMM d, y",H:"EEE, MMM d",ja:"EEE, MMM d, y",f:"d"},d={I:"y",la:"G y",J:"y MMM",K:"y MMMM",s:"MMM d",u:"MMMM dd",w:"d/M",v:"MMMM d",V:"y MMM d",H:"MMM d, EEE",ja:"y MMM d, EEE",f:"d"};var h;
h={R:["\u0d15\u0d4d\u0d30\u0d3f.\u0d2e\u0d41.","\u0d0e\u0d21\u0d3f"],P:["\u0d15\u0d4d\u0d30\u0d3f\u0d38\u0d4d\u200c\u0d24\u0d41\u0d35\u0d3f\u0d28\u0d4d \u0d2e\u0d41\u0d2e\u0d4d\u0d2a\u0d4d","\u0d06\u0d28\u0d4d\u0d28\u0d4b \u0d21\u0d4a\u0d2e\u0d3f\u0d28\u0d3f"],W:"\u0d1c \u0d2b \u0d2e\u0d3e \u0d0f \u0d2e\u0d46 \u0d1c\u0d42 \u0d1c\u0d42 \u0d13 \u0d38 \u0d12 \u0d28 \u0d21\u0d3f".split(" "),ca:"\u0d1c \u0d2b\u0d46 \u0d2e\u0d3e \u0d0f \u0d2e\u0d46 \u0d1c\u0d42 \u0d1c\u0d42 \u0d13 \u0d38\u0d46 \u0d12 \u0d28 \u0d21\u0d3f".split(" "),U:"\u0d1c\u0d28\u0d41\u0d35\u0d30\u0d3f \u0d2b\u0d46\u0d2c\u0d4d\u0d30\u0d41\u0d35\u0d30\u0d3f \u0d2e\u0d3e\u0d7c\u0d1a\u0d4d\u0d1a\u0d4d \u0d0f\u0d2a\u0d4d\u0d30\u0d3f\u0d7d \u0d2e\u0d47\u0d2f\u0d4d \u0d1c\u0d42\u0d7a \u0d1c\u0d42\u0d32\u0d48 \u0d13\u0d17\u0d38\u0d4d\u0d31\u0d4d\u0d31\u0d4d \u0d38\u0d46\u0d2a\u0d4d\u0d31\u0d4d\u0d31\u0d02\u0d2c\u0d7c \u0d12\u0d15\u0d4d\u200c\u0d1f\u0d4b\u0d2c\u0d7c \u0d28\u0d35\u0d02\u0d2c\u0d7c \u0d21\u0d3f\u0d38\u0d02\u0d2c\u0d7c".split(" "),
ba:"\u0d1c\u0d28\u0d41\u0d35\u0d30\u0d3f \u0d2b\u0d46\u0d2c\u0d4d\u0d30\u0d41\u0d35\u0d30\u0d3f \u0d2e\u0d3e\u0d7c\u0d1a\u0d4d\u0d1a\u0d4d \u0d0f\u0d2a\u0d4d\u0d30\u0d3f\u0d7d \u0d2e\u0d47\u0d2f\u0d4d \u0d1c\u0d42\u0d7a \u0d1c\u0d42\u0d32\u0d48 \u0d13\u0d17\u0d38\u0d4d\u0d31\u0d4d\u0d31\u0d4d \u0d38\u0d46\u0d2a\u0d4d\u0d31\u0d4d\u0d31\u0d02\u0d2c\u0d7c \u0d12\u0d15\u0d4d\u200c\u0d1f\u0d4b\u0d2c\u0d7c \u0d28\u0d35\u0d02\u0d2c\u0d7c \u0d21\u0d3f\u0d38\u0d02\u0d2c\u0d7c".split(" "),Z:"\u0d1c\u0d28\u0d41 \u0d2b\u0d46\u0d2c\u0d4d\u0d30\u0d41 \u0d2e\u0d3e\u0d7c \u0d0f\u0d2a\u0d4d\u0d30\u0d3f \u0d2e\u0d47\u0d2f\u0d4d \u0d1c\u0d42\u0d7a \u0d1c\u0d42\u0d32\u0d48 \u0d13\u0d17 \u0d38\u0d46\u0d2a\u0d4d\u0d31\u0d4d\u0d31\u0d02 \u0d12\u0d15\u0d4d\u0d1f\u0d4b \u0d28\u0d35\u0d02 \u0d21\u0d3f\u0d38\u0d02".split(" "),
ea:"\u0d1c\u0d28\u0d41 \u0d2b\u0d46\u0d2c\u0d4d\u0d30\u0d41 \u0d2e\u0d3e\u0d7c \u0d0f\u0d2a\u0d4d\u0d30\u0d3f \u0d2e\u0d47\u0d2f\u0d4d \u0d1c\u0d42\u0d7a \u0d1c\u0d42\u0d32\u0d48 \u0d13\u0d17 \u0d38\u0d46\u0d2a\u0d4d\u0d31\u0d4d\u0d31\u0d02 \u0d12\u0d15\u0d4d\u0d1f\u0d4b \u0d28\u0d35\u0d02 \u0d21\u0d3f\u0d38\u0d02".split(" "),ia:"\u0d1e\u0d3e\u0d2f\u0d31\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d24\u0d3f\u0d19\u0d4d\u0d15\u0d33\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d1a\u0d4a\u0d35\u0d4d\u0d35\u0d3e\u0d34\u0d4d\u0d1a \u0d2c\u0d41\u0d27\u0d28\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d35\u0d4d\u0d2f\u0d3e\u0d34\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d35\u0d46\u0d33\u0d4d\u0d33\u0d3f\u0d2f\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d36\u0d28\u0d3f\u0d2f\u0d3e\u0d34\u0d4d\u200c\u0d1a".split(" "),
ga:"\u0d1e\u0d3e\u0d2f\u0d31\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d24\u0d3f\u0d19\u0d4d\u0d15\u0d33\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d1a\u0d4a\u0d35\u0d4d\u0d35\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d2c\u0d41\u0d27\u0d28\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d35\u0d4d\u0d2f\u0d3e\u0d34\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d35\u0d46\u0d33\u0d4d\u0d33\u0d3f\u0d2f\u0d3e\u0d34\u0d4d\u200c\u0d1a \u0d36\u0d28\u0d3f\u0d2f\u0d3e\u0d34\u0d4d\u200c\u0d1a".split(" "),aa:"\u0d1e\u0d3e\u0d2f\u0d7c \u0d24\u0d3f\u0d19\u0d4d\u0d15\u0d7e \u0d1a\u0d4a\u0d35\u0d4d\u0d35 \u0d2c\u0d41\u0d27\u0d7b \u0d35\u0d4d\u0d2f\u0d3e\u0d34\u0d02 \u0d35\u0d46\u0d33\u0d4d\u0d33\u0d3f \u0d36\u0d28\u0d3f".split(" "),
fa:"\u0d1e\u0d3e\u0d2f\u0d7c \u0d24\u0d3f\u0d19\u0d4d\u0d15\u0d7e \u0d1a\u0d4a\u0d35\u0d4d\u0d35 \u0d2c\u0d41\u0d27\u0d7b \u0d35\u0d4d\u0d2f\u0d3e\u0d34\u0d02 \u0d35\u0d46\u0d33\u0d4d\u0d33\u0d3f \u0d36\u0d28\u0d3f".split(" "),X:"\u0d1e \u0d24\u0d3f \u0d1a\u0d4a \u0d2c\u0d41 \u0d35\u0d4d\u0d2f\u0d3e \u0d35\u0d46 \u0d36".split(" "),da:"\u0d1e\u0d3e \u0d24\u0d3f \u0d1a\u0d4a \u0d2c\u0d41 \u0d35\u0d4d\u0d2f\u0d3e \u0d35\u0d46 \u0d36".split(" "),$:["\u0d12\u0d28\u0d4d\u0d28\u0d3e\u0d02 \u0d2a\u0d3e\u0d26\u0d02",
"\u0d30\u0d23\u0d4d\u0d1f\u0d3e\u0d02 \u0d2a\u0d3e\u0d26\u0d02","\u0d2e\u0d42\u0d28\u0d4d\u0d28\u0d3e\u0d02 \u0d2a\u0d3e\u0d26\u0d02","\u0d28\u0d3e\u0d32\u0d3e\u0d02 \u0d2a\u0d3e\u0d26\u0d02"],Y:["\u0d12\u0d28\u0d4d\u0d28\u0d3e\u0d02 \u0d2a\u0d3e\u0d26\u0d02","\u0d30\u0d23\u0d4d\u0d1f\u0d3e\u0d02 \u0d2a\u0d3e\u0d26\u0d02","\u0d2e\u0d42\u0d28\u0d4d\u0d28\u0d3e\u0d02 \u0d2a\u0d3e\u0d26\u0d02","\u0d28\u0d3e\u0d32\u0d3e\u0d02 \u0d2a\u0d3e\u0d26\u0d02"],M:["AM","PM"],N:["y, MMMM d, EEEE","y, MMMM d","y, MMM d",
"d/M/yy"],ha:["h:mm:ss a zzzz","h:mm:ss a z","h:mm:ss a","h:mm a"],O:["{1} {0}","{1} {0}","{1} {0}","{1} {0}"],S:6,ka:[6,6],T:5};var l={h:".",l:",",B:"%",L:"0",F:"+",o:"-",j:"E",D:"\u2030",m:"\u221e",A:"NaN",g:"#,##0.###",G:"#E0",C:"#,##0%",c:"\u00a4#,##0.00",i:"USD"},l={h:".",l:",",B:"%",L:"0",F:"+",o:"-",j:"E",D:"\u2030",m:"\u221e",A:"NaN",g:"#,##,##0.###",G:"#E0",C:"#,##0%",c:"\u00a4#,##0.00",i:"INR"};b("I18N_DATETIMESYMBOLS_ERAS",h.R);b("I18N_DATETIMESYMBOLS_ERANAMES",h.P);b("I18N_DATETIMESYMBOLS_NARROWMONTHS",h.W);b("I18N_DATETIMESYMBOLS_STANDALONENARROWMONTHS",h.ca);b("I18N_DATETIMESYMBOLS_MONTHS",h.U);b("I18N_DATETIMESYMBOLS_STANDALONEMONTHS",h.ba);b("I18N_DATETIMESYMBOLS_SHORTMONTHS",h.Z);b("I18N_DATETIMESYMBOLS_STANDALONESHORTMONTHS",h.ea);b("I18N_DATETIMESYMBOLS_WEEKDAYS",h.ia);b("I18N_DATETIMESYMBOLS_STANDALONEWEEKDAYS",h.ga);b("I18N_DATETIMESYMBOLS_SHORTWEEKDAYS",h.aa);
b("I18N_DATETIMESYMBOLS_STANDALONESHORTWEEKDAYS",h.fa);b("I18N_DATETIMESYMBOLS_NARROWWEEKDAYS",h.X);b("I18N_DATETIMESYMBOLS_STANDALONENARROWWEEKDAYS",h.da);b("I18N_DATETIMESYMBOLS_SHORTQUARTERS",h.$);b("I18N_DATETIMESYMBOLS_QUARTERS",h.Y);b("I18N_DATETIMESYMBOLS_AMPMS",h.M);b("I18N_DATETIMESYMBOLS_DATEFORMATS",h.N);b("I18N_DATETIMESYMBOLS_TIMEFORMATS",h.ha);b("I18N_DATETIMESYMBOLS_DATETIMEFORMATS",h.O);b("I18N_DATETIMESYMBOLS_FIRSTDAYOFWEEK",h.S);b("I18N_DATETIMESYMBOLS_WEEKENDRANGE",h.ka);
b("I18N_DATETIMESYMBOLS_FIRSTWEEKCUTOFFDAY",h.T);b("I18N_DATETIMEPATTERNS_YEAR_FULL",d.I);b("I18N_DATETIMEPATTERNS_YEAR_MONTH_ABBR",d.J);b("I18N_DATETIMEPATTERNS_YEAR_MONTH_FULL",d.K);b("I18N_DATETIMEPATTERNS_MONTH_DAY_ABBR",d.s);b("I18N_DATETIMEPATTERNS_MONTH_DAY_FULL",d.u);b("I18N_DATETIMEPATTERNS_MONTH_DAY_SHORT",d.w);b("I18N_DATETIMEPATTERNS_MONTH_DAY_MEDIUM",d.v);b("I18N_DATETIMEPATTERNS_WEEKDAY_MONTH_DAY_MEDIUM",d.H);b("I18N_DATETIMEPATTERNS_DAY_ABBR",d.f);
void 0!==h.ma&&b("I18N_DATETIMESYMBOLS_ZERODIGIT",h.ma);b("I18N_NUMBERFORMATSYMBOLS_DECIMAL_SEP",l.h);b("I18N_NUMBERFORMATSYMBOLS_GROUP_SEP",l.l);b("I18N_NUMBERFORMATSYMBOLS_PERCENT",l.B);b("I18N_NUMBERFORMATSYMBOLS_ZERO_DIGIT",l.L);b("I18N_NUMBERFORMATSYMBOLS_PLUS_SIGN",l.F);b("I18N_NUMBERFORMATSYMBOLS_MINUS_SIGN",l.o);b("I18N_NUMBERFORMATSYMBOLS_EXP_SYMBOL",l.j);b("I18N_NUMBERFORMATSYMBOLS_PERMILL",l.D);b("I18N_NUMBERFORMATSYMBOLS_INFINITY",l.m);b("I18N_NUMBERFORMATSYMBOLS_NAN",l.A);
b("I18N_NUMBERFORMATSYMBOLS_DECIMAL_PATTERN",l.g);b("I18N_NUMBERFORMATSYMBOLS_SCIENTIFIC_PATTERN",l.G);b("I18N_NUMBERFORMATSYMBOLS_PERCENT_PATTERN",l.C);b("I18N_NUMBERFORMATSYMBOLS_CURRENCY_PATTERN",l.c);b("I18N_NUMBERFORMATSYMBOLS_DEF_CURRENCY_CODE",l.i);b("I18N_COMPACT_DECIMAL_SHORT_PATTERN",c.b);b("I18N_COMPACT_DECIMAL_LONG_PATTERN",c.a);