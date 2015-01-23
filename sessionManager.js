// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
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

/*
  MIT License: 

  Permission is hereby granted, free of charge, to any person obtaining 
  a copy of this software and associated documentation files (the 
  ""Software""), to deal in the Software without restriction, including 
  without limitation the rights to use, copy, modify, merge, publish, 
  distribute, sublicense, and/or sell copies of the Software, and to 
  permit persons to whom the Software is furnished to do so, subject to 
  the following conditions: 

  The above copyright notice and this permission notice shall be 
  included in all copies or substantial portions of the Software. 

  THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND, 
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/