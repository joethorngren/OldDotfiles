// Generated by CoffeeScript 1.11.0
(function() {
  var cleanUpRegexp;

  cleanUpRegexp = function(re) {
    return re.toString().replace(/^\//, '').replace(/\/$/, '').replace(/\\\//g, "/");
  };

  DomUtils.documentReady(function() {
    var base, engine, html, i, j, len, len1, re, ref, ref1;
    html = [];
    ref = CompletionEngines.slice(0, CompletionEngines.length - 1);
    for (i = 0, len = ref.length; i < len; i++) {
      engine = ref[i];
      engine = new engine;
      html.push("<h4>" + engine.constructor.name + "</h4>\n");
      html.push("<div class=\"engine\">");
      if (engine.example.explanation) {
        html.push("<p>" + engine.example.explanation + "</p>");
      }
      if (engine.example.searchUrl && engine.example.keyword) {
        (base = engine.example).description || (base.description = engine.constructor.name);
        html.push("<p>");
        html.push("Example:");
        html.push("<pre>");
        html.push(engine.example.keyword + ": " + engine.example.searchUrl + " " + engine.example.description);
        html.push("</pre>");
        html.push("</p>");
      }
      if (engine.regexps) {
        html.push("<p>");
        html.push("Regular expression" + (1 < engine.regexps.length ? 's' : '') + ":");
        html.push("<pre>");
        ref1 = engine.regexps;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          re = ref1[j];
          html.push((cleanUpRegexp(re)) + "\n");
        }
        html.push("</pre>");
        html.push("</p>");
      }
      html.push("</div>");
    }
    return document.getElementById("engineList").innerHTML = html.join("");
  });

}).call(this);
