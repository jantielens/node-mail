// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
var outlook = require("node-outlook");
var clientId = require("./clientId");

var credentials = {
  clientID: clientId.clientId,
  clientSecret: clientId.clientSecret,
  site: "https://login.windows.net/common",
  authorizationPath: "/oauth2/authorize",
  tokenPath: "/oauth2/token"
}
var oauth2 = require("simple-oauth2")(credentials)

var redirectUri = "http://localhost:8000/authorize";
var tokenPath = "/common/oauth2/token"

function getAccessToken(resource, session) {
  console.log("getAccessToken called for " + session);
  var deferred = new outlook.Microsoft.Utility.Deferred();
  if (session.token.expired()) {
    session.token.refresh(function(error, result) {
      if (error) {
        console.log("Refresh token error: ", error.message);
      }
      session.token = result;
      console.log("NEW ACCESS TOKEN: ", session.token.token.access_token);
      deferred.resolve(session.token.token.access_token);
    });
  }
  else {
    // Return the token right away
    console.log("EXISTING ACCESS TOKEN: ", session.token.token.access_token);
    deferred.resolve(session.token.token.access_token);
  }
  return deferred;
}

function getAccessTokenFn(resource, session) {
  return function() {
    return getAccessToken(resource, session);
  }
}

function getAuthUrl() {
  var returnVal = oauth2.authCode.authorizeURL({
    redirect_uri: redirectUri
  });
  console.log("Generated auth url: " + returnVal);
  return returnVal;
}

function getTokenFromCode(auth_code, resource, response, redirect, session) {
  var token;
  oauth2.authCode.getToken({
    code: auth_code,
    redirect_uri: redirectUri,
    resource: resource
    }, function (error, result) {
      if (error) {
        console.log("Access token error: ", error.message);
      }
      token = oauth2.accessToken.create(result);
      console.log("Token created: ", token.token);
      session.updateTokens(token);
      console.log("Redirecting to " + redirect);
      response.writeHead(302, {'Location': redirect});
      response.end();;
    });
}

exports.getAuthUrl = getAuthUrl;
exports.getTokenFromCode = getTokenFromCode;
exports.getAccessTokenFn = getAccessTokenFn;

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