const allExt = [".js", ".png", ".jpg", ".ico", ".css", ".woff2"];
var path = require("path");

const frontendPrefix = process.env.FRONTEND_PREFIX || "./Front/dist";

// reference:
// https://medium.com/@bo.vandersteene/use-nest-as-your-server-side-application-with-an-angular-frontend-540b0365bfa3
function frontendHook(req, res, next) {
  const url = req.url;
  if (url.startsWith("/api")) {
    // it starts with /api --> continue with execution
    next();
  } else if (allExt.some((ext) => url.endsWith(ext))) {
    // it has a file extension --> resolve the file
    res.sendFile(path.resolve(frontendPrefix + url));
  } else {
    // in all other cases, redirect to the index.html!
    res.sendFile(path.resolve(frontendPrefix + "/index.html"));
  }
}

module.exports = frontendHook;
