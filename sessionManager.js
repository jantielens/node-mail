var Session = require("./session").Session;

var sessions = [];
var cookieName = "SESSION";

function SessionManager() {
  this.getSession = function(request, response) {
    var cookie = request.headers.cookie;
    console.log("Cookie value: " + cookie);
    if (cookie && cookie.indexOf(cookieName) !== -1) {
      // Found our session, extract it from the cookie value
      var start = cookie.indexOf(cookieName) + cookieName.length + 1;
      var end = cookie.indexOf(';', start);
      end = end === -1 ? cookie.length : end;
      var value = cookie.substring(start, end);
      console.log("Session found in cookie: " + value);
      
      if (sessions[value]) {
        console.log("Session found in cache.");
        return sessions[value];
        }
      console.log("Session not found in cache!");
    }

    // No session in the incoming request, or
    // session value wasn't in our array. Create a new
    // one.
    var session = new Session();
    console.log("Created new session: " + session);
    response.setHeader('Set-Cookie', [cookieName + '=' + session + ';Max-Age=3600']);
    return sessions[session] = session;
  }
}

exports.SessionManager = SessionManager;