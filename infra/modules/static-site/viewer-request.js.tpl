function handler(event) {
  var req  = event.request;
  var host = req.headers.host && req.headers.host.value;
  var uri  = req.uri || "/";

  var canonical = "${canonical_domain}";
  var redirectFrom = "${redirect_www_from}";

  function buildQuery(req) {
    var qs = req.querystring;
    if (!qs || Object.keys(qs).length === 0) return "";
    var parts = [];
    for (var key in qs) {
      if (!qs.hasOwnProperty(key)) continue;
      var v = qs[key] && qs[key].value;
      if (v === undefined || v === null) continue;
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(v));
    }
    return parts.length ? "?" + parts.join("&") : "";
  }

  if (redirectFrom && host === redirectFrom) {
    var location = "https://" + canonical + uri + buildQuery(req);
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: { value: location }
      }
    };
  }

  if (uri.endsWith("/")) {
    req.uri = uri + "index.html";
  } else if (uri.indexOf(".") === -1) {
    req.uri = uri + "/index.html";
  }

  return req;
}
