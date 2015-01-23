var querystring = require("querystring"),
    url = require("url"),
    exchange = require("exchange"),
    authHelper = require("./authHelper"),
    SessionManager = require("./sessionManager").SessionManager;
    
var sessionManager = new SessionManager();

function mail(response, request) {
  console.log("Request handler 'mail' was called.");

  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  if (session.accessToken === "" && 
      session.refreshToken === "") {
    // Need to kick off code grant flow
    renderSignUpPage(response);
  }
  else {
    // We have a token, render the mail list
    renderMailPage(response, session);
  }
}

function calendar(response, request) {
  console.log("Request handler 'calendar' was called.");

  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  if (session.accessToken === "" && 
      session.refreshToken === "") {
    // Need to kick off code grant flow
    renderSignUpPage(response, session);
  }
  else {
    // We have a token, render the mail list
    renderCalendarPage(response, session);
  }
}

function contacts(response, request) {
  console.log("Request handler 'contacts' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write('<p>Nothing to see here. <a href="mail">Go back to mail</a></p>');
  response.end();
}

function authorize(response, request) {
  console.log("Request handler 'authorize' was called.");
  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  var url_parts = url.parse(request.url, true);
  var code = url_parts.query.code;
  console.log("Code: " + code);
  
  if (code && code !== ""){
    var result = authHelper.getTokenFromCode(code, "https://outlook.office365.com", 
      response, '/calendar', session);
  }
  else {
    console.log("Bad code.");
  }
}

function writeSession(response, session) {
  response.write("<p>Session ID: " + session + "</p>");
  response.write("<p>Access Token: " + session.accessToken + "</p>");
  response.write("<p>Refresh Token: " + session.refreshToken + "</p>");
  response.write("<p>Token Expires: " + session.tokenExpires + "</p>");
}

function renderSignUpPage(response, session) {
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write('<p>Please <a href="' + authHelper.getAuthUrl() + '">sign in</a> with your Office 365 account.</p>');
  writeSession(response, session);
  response.end();
}

function renderMailPage(response, session) {
  var outlookClient = new exchange.Microsoft.OutlookServices.Client('https://outlook.office365.com/api/v1.0', 
    authHelper.getAccessTokenFn('https://outlook.office365.com/', session));
  
  response.writeHead(200, {"Content-Type": "text/html"});
  
  outlookClient.me.folders.getFolder('Inbox').messages.getMessages()
    .orderBy('DateTimeReceived desc').fetchAll(10).then(function (result) {
      result.forEach(function (message) {
        response.write("<p>Message: " + message.subject + ", Received: " + message.dateTimeReceived.toString() + "</p>");
      });
      response.end();
    }, function (error) {
      console.log(error);
      response.write("<p>ERROR: " + error + "</p>");
      response.end();
    });
}

function renderCalendarPage(response, session) {
  var outlookClient = new exchange.Microsoft.OutlookServices.Client('https://outlook.office365.com/api/v1.0', 
    authHelper.getAccessTokenFn('https://outlook.office365.com/', session));
  
  response.writeHead(200, {"Content-Type": "text/html"});
  
  outlookClient.me.events.getEvents().fetch().then(function (result) {
      result.currentPage.forEach(function (event) {
        response.write("<p>Event: " + event.subject + ", Start: " + event.start.toString() + ", End: " + event.end.toString() + "</p>");
      });
      response.end();
    }, function (error) {
      console.log(error);
      response.write("<p>ERROR: " + error + "</p>");
      response.end();
    });
}

exports.mail = mail;
exports.calendar = calendar;
exports.contacts = contacts;
exports.authorize = authorize;