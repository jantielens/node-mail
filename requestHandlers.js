// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
var querystring = require("querystring"),
    url = require("url"),
    exchange = require("./lib/exchange"),
    authHelper = require("./authHelper"),
    SessionManager = require("./sessionManager").SessionManager;
    
var sessionManager = new SessionManager();

function mail(response, request) {
  console.log("Request handler 'mail' was called.");

  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  if (session.token) {
    // We have a token, render the mail list
    renderMailPage(response, session);
  }
  else {
    // Need to kick off code grant flow
    renderSignUpPage(response);
  }
}

function calendar(response, request) {
  console.log("Request handler 'calendar' was called.");

  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  if (session.token){
    // We have a token, render the calendar
    renderCalendarPage(response, session);
  }
  else {
    // Need to kick off code grant flow
    renderSignUpPage(response, session);
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
  response.write('<table style="width:100%"><tr><th>Session field</th><th>Value</th></tr>');
  response.write("<tr><td>Session ID</td><td>" + session + "</td></tr>");
  var accessToken = session.token ? session.token.token.access_token : "NONE";
  var refreshToken = session.token ? session.token.token.refresh_token : "NONE";
  var expireDate = session.token ? new Date(session.token.token.expires_on * 1000) : "NONE";
  response.write("<tr><td>Access Token</td><td>" + accessToken + "</td></tr>");
  response.write("<tr><td>Refresh Token</td><td>" + refreshToken + "</td></tr>");
  response.write("<tr><td>Access Token Expires</td><td>" + expireDate + "</td></tr>");
  response.write('</table>');
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
  
  response.write('<table style="width:100%"><tr><th>Subject</th><th>Start</th><th>End</th></tr>');
  
  outlookClient.me.events.getEvents().fetch().then(function (result) {
      result.currentPage.forEach(function (event) {
        response.write("<tr><td>" + event.subject + "</td><td>" + event.start.toString() + "</td><td>" + event.end.toString() + "</td></tr>");
      });
      response.write('</table>');
      writeSession(response, session);
      response.end();
    }, function (error) {
      console.log(error);
      response.write('</table');
      response.write("<p>ERROR: " + error + "</p>");
      writeSession(response, session);
      response.end();
    });
}

exports.mail = mail;
exports.calendar = calendar;
exports.contacts = contacts;
exports.authorize = authorize;

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