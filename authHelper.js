var querystring = require("querystring");
var https = require("https");
var exchange = require("exchange");

var clientId = "b7c6f617-f7f5-4f11-8ced-2e39aa23c352";
var clientSecret = "TCmtjhvNoazeZYPIrq58AEGmRED/dYcixgS/+ELkiyU=";
var redirectUri = "http://localhost:8000/authorize";

var authority = "login.windows.net"
var authUrl = "https://" + authority + "/common/oauth2/authorize?client_id=" + clientId + "&redirect_uri=XXXXX&response_type=code";
var tokenPath = "/common/oauth2/token"

function getAccessToken(resource, session) {
  console.log("getAccessToken called for " + session);
  var deferred = new exchange.Microsoft.Utility.Deferred();
  // Need to check if the token is about to expire and refresh
  deferred.resolve(session.accessToken);
  return deferred;
}

function getAccessTokenFn(resource, session) {
  return function() {
    return getAccessToken(resource, session);
  }
}

function getAuthUrl() {
  var returnVal = authUrl.replace('XXXXX', querystring.escape(redirectUri));
  console.log("Generated auth url: " + returnVal);
  return returnVal;
}

function getTokenFromCode(auth_code, resource, response, redirect, session) {
  var jsonPayload = {
    grant_type: 'authorization_code',
    code: auth_code,
    redirect_uri: redirectUri,
    resource: resource,
    client_id: clientId,
    client_secret: clientSecret
  };

  var options = {
    hostname: authority,
    path: tokenPath,
    method: 'POST'
  };
  
  var responsePayload = "";
  
  var request = https.request(options, function(res) {
    console.log("Response received from token request.");
    console.log("Status: " + response.statusCode);
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      console.log("Received response chunk: " + chunk);
      responsePayload += chunk;
    });
    res.on('end', function() {
      // Send full response back.
      console.log("Full payload: " + responsePayload);
      session.updateTokens(JSON.parse(responsePayload));
      console.log("Redirecting to " + redirect);
      response.writeHead(302, {'Location': redirect});
      response.end();
    });
  });
  console.log("Sending payload: " + querystring.stringify(jsonPayload));
  request.write(querystring.stringify(jsonPayload));
  request.end();
}

exports.getAuthUrl = getAuthUrl;
exports.getTokenFromCode = getTokenFromCode;
exports.getAccessTokenFn = getAccessTokenFn;