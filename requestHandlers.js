// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
var querystring = require("querystring"),
    url = require("url"),
    fs = require("fs"),
    formidable = require("formidable"),
    outlook = require("node-outlook"),
    authHelper = require("./authHelper"),
    SessionManager = require("./sessionManager").SessionManager;
    
var sessionManager = new SessionManager();

// Handler for /
function home(response, request) {
  console.log("Request handler 'home' was called.");

  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  if (session.isLoggedIn()) {
    // We have a token, render the home page
    renderHomePage(response, session);
  }
  else {
    // Need to kick off code grant flow
    renderSignUpPage(response, session);
  }
}

// Handler for /mail
function mail(response, request) {
  console.log("Request handler 'mail' was called.");

  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  if (session.isLoggedIn()) {
    // We have a token, render the mail list
    renderMailPage(response, session);
  }
  else {
    // Need to kick off code grant flow
    renderSignUpPage(response, session);
  }
}

// Handler for /calendar
function calendar(response, request) {
  console.log("Request handler 'calendar' was called.");

  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  if (session.isLoggedIn()){
    // We have a token, render the calendar
    //renderCalendarPage(response, session);
    renderCalendarPageWithView(response, session);
  }
  else {
    // Need to kick off code grant flow
    renderSignUpPage(response, session);
  }
}

// Handler for /contacts
function contacts(response, request) {
  console.log("Request handler 'contacts' was called.");

  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  if (session.isLoggedIn()){
    // We have a token, render the calendar
    renderContactsPage(response, session);
  }
  else {
    // Need to kick off code grant flow
    renderSignUpPage(response, session);
  }
}

function deleteItem(response, request) {
  console.log("Request handler 'delete' was called.");
  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  if (session.isLoggedIn()) {
    var outlookClient = new outlook.Microsoft.OutlookServices.Client('https://outlook.office365.com/api/v1.0', 
      authHelper.getAccessTokenFn('https://outlook.office365.com/', session));
  
    var url_parts = url.parse(request.url, true);
    console.log("Item type:", url_parts.query.itemType);
    console.log("Item ID:", url_parts.query.itemId);
    
    var redirectUrl;
    var fetcher;
    switch (url_parts.query.itemType) {
      case 'message':
        redirectUrl = "/mail"
        fetcher = outlookClient.me.messages.getMessage(url_parts.query.itemId);
        break;
      case 'event':
        redirectUrl = "/calendar"
        fetcher = outlookClient.me.events.getEvent(url_parts.query.itemId);
        break;
      case 'contact':
        redirectUrl = "/contacts"
        fetcher = outlookClient.me.contacts.getContact(url_parts.query.itemId);
        break;
      default:
        redirectUrl = "/"
    }
    
    if (fetcher) {
      fetcher.fetch().then(function (item) {
        console.log("Item retrieved.");
        item.delete().then(function () {
          console.log("Item deleted.");
          redirectTo(response, redirectUrl);
        }, function (error) {
          console.log("ERROR:", error);
          redirectTo(response, redirectUrl);
        });
      }, function (error) {
        console.log("ERROR:", error);
        redirectTo(response, redirectUrl);
      });
    }
    else {
      console.log("Invalid item type!");
      redirectTo(response, redirectUrl);
    }
  }
  else {
    console.log("User not logged in, redirecting to home page.");
    redirectTo(response, "/");
  }
}

function editField(response, request) {
  console.log("Request handler 'edit' was called.");
  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  if (session.isLoggedIn()) {
    var url_parts = url.parse(request.url, true);
    console.log("Item type:", url_parts.query.itemType);
    console.log("Item ID:", url_parts.query.itemId);
    console.log("Field name:", url_parts.query.fieldName);
    console.log("Current value:", url_parts.query.value);
    
    renderEditFieldPage(response, session, url_parts.query.itemType, url_parts.query.itemId, 
      url_parts.query.fieldName, url_parts.query.value);
  }
  else {
    console.log("User not logged in, redirecting to home page.");
    redirectTo(response, "/");
  }
}

function updateItem(response, request) {
  console.log("Request handler 'update' was called.");
  if (request.method == 'POST') { 
    var session = sessionManager.getSession(request, response);
    console.log("Session: " + session);
    
    if (session.isLoggedIn()) {
      var outlookClient = new outlook.Microsoft.OutlookServices.Client('https://outlook.office365.com/api/v1.0', 
        authHelper.getAccessTokenFn('https://outlook.office365.com/', session));
        
      var form = new formidable.IncomingForm();
      form.parse(request, function(error, fields, files) {
        console.log("Item type:", fields.itemType);
        console.log("Item ID:", fields.itemId);
        console.log("Field name:", fields.fieldName);
        console.log("Value:", fields.value);
        
        var fetcher;
        switch(fields.itemType) {
          case 'message':
            redirectUrl = "/mail"
            fetcher = outlookClient.me.messages.getMessage(fields.itemId);
          break;
        case 'event':
          redirectUrl = "/calendar"
          fetcher = outlookClient.me.events.getEvent(fields.itemId);
          break;
        case 'contact':
          redirectUrl = "/contacts"
          fetcher = outlookClient.me.contacts.getContact(fields.itemId);
          break;
        default:
          redirectUrl = "/"
        }
        
        if (fetcher) {
          fetcher.fetch().then(function (item) {
            console.log("Item retrieved.");
            
            var fieldUpdated = false;
            switch(fields.fieldName) {
              case 'subject':
                item.subject = fields.value;
                fieldUpdated = true;
                break;
              case 'mobilePhone1':
                item.mobilePhone1 = fields.value;
                fieldUpdated = true;
                break;
            }
            
            if (fieldUpdated) {
              item.update().then(function () {
                console.log("Item updated.");
                redirectTo(response, redirectUrl);
              }, function (error) {
                console.log("ERROR:", error);
                redirectTo(response, redirectUrl);
              });
            }
            else {
              console.log("Invalid field name.");
              redirectTo(response, redirectUrl);
            }
          }, function (error) {
            console.log("ERROR:", error);
            redirectTo(response, redirectUrl);
          });
        }
        else {
          console.log("Invalid item type!");
          redirectTo(response, redirectUrl);
        }
      });   
    }
    else {
      console.log("User not logged in, redirecting to home page.");
      redirectTo(response, "/");
    }
  }
  else {
    console.log(request.method, "not supported.");
    redirectTo(response, "/");
  }
}

// Handler for /authorize (redirect URL for OAuth code grant flow)
function authorize(response, request) {
  console.log("Request handler 'authorize' was called.");
  var session = sessionManager.getSession(request, response);
  console.log("Session: " + session);
  
  // The authorization code is passed as a query parameter
  var url_parts = url.parse(request.url, true);
  var code = url_parts.query.code;
  console.log("Code: " + code);
  
  if (code && code !== ""){
    var result = authHelper.getTokenFromCode(code, "https://outlook.office365.com", 
      response, '/', session);
  }
  else {
    console.log("Bad code.");
  }
}

// Handler for /logout
function logout(response, request) {
  console.log("Request handler 'logout' was called.");
  var session = sessionManager.getSession(request, response);
  // Remove tokens and user info from session
  session.logout();
  
  // Redirect user to the Azure logout page. After logout,
  // user will be redirected to our home page.
  var logoutUri = "https://login.windows.net/common/oauth2/logout?" +
    querystring.stringify({post_logout_redirect_uri: 'http://127.0.0.1:8000'});
  response.writeHead(302, {"Location": logoutUri});
  response.end();
}

// Debug function to write out the contents of the session
function writeSession(response, session) {
  response.write('<pre class="debug-dump">');
  response.write("Session ID: " + session + "\n");
  var accessToken = session.token ? session.token.token.access_token : "NONE";
  var refreshToken = session.token ? session.token.token.refresh_token : "NONE";
  var expireDate = session.token ? new Date(session.token.token.expires_on * 1000) : "NONE";
  response.write("Access Token: " + accessToken + "\n");
  response.write("Refresh Token: " + refreshToken + "\n");
  response.write("Access Token Expires: " + expireDate + "\n");
  response.write('</pre>');
}

function renderSignUpPage(response, session) {
  response.writeHead(200, {"Content-Type": "text/html"});
  renderCommonElements(response, session);
  response.write('<p>Please <a href="' + authHelper.getAuthUrl() + '">sign in</a> with your Office 365 account.</p>');
  writeSession(response, session);
  response.end();
}

function renderHomePage(response, session) {
  response.writeHead(200, {"Content-Type": "text/html"});
  renderCommonElements(response, session);
  
  response.write('<h1>Welcome, ' + session.userName + '!</h1>');
  writeSession(response, session);
  response.end();
}

function renderMailPage(response, session) {
  var outlookClient = new outlook.Microsoft.OutlookServices.Client('https://outlook.office365.com/api/v1.0', 
    authHelper.getAccessTokenFn('https://outlook.office365.com/', session));
  
  response.writeHead(200, {"Content-Type": "text/html"});
  renderCommonElements(response, session);
  response.write('<div><span id="table-title">Your inbox</span></div>');
  response.write('<table class="item-list"><tr><th class="button"></th><th>From</th><th>Subject</th><th>Received</th></tr>');
  
  var altRow = false;
  
  outlookClient.me.messages.getMessages()
  .orderBy('DateTimeReceived desc').fetchAll().then(function (result) {
    result.forEach(function (message) {
      var rowClass = altRow ? "alt" : "normal";
      var from = message.from ? message.from.emailAddress.name : "NONE";
      response.write('<tr class="' + rowClass + '"><td class="button">' + createDeleteButton(message.id, 'message') + 
        '</td><td>' + from + 
        '</td><td>' + message.subject + createEditButton(message.id, 'message', 'subject', message.subject) +
        '</td><td>' + message.dateTimeReceived.toString() + '</td></tr>');
      altRow = !altRow;
    });
    response.write('</table>');
    writeSession(response, session);
    response.end();
  }, function (error) {
    console.log(error);
    response.write("<p>ERROR: " + error + "</p>");
    writeSession(response, session);
    response.end();
  });
}

function renderCalendarPage(response, session) {
  var outlookClient = new outlook.Microsoft.OutlookServices.Client('https://outlook.office365.com/api/v1.0', 
    authHelper.getAccessTokenFn('https://outlook.office365.com/', session));
  
  response.writeHead(200, {"Content-Type": "text/html"});
  renderCommonElements(response, session);
  response.write('<div><span id="table-title">Your calendar</span></div>');
  response.write('<table class="item-list"><tr><th class="button"></th><th>Subject</th><th>Start</th><th>End</th></tr>');
  
  var altRow = false;
  
  outlookClient.me.events.getEvents().fetch().then(function (result) {
    result.currentPage.forEach(function (event) {
      var rowClass = altRow ? "alt" : "normal";
      response.write('<tr class="' + rowClass + '"><td class="button">' + createDeleteButton(event.id, 'event') + 
        '</td><td>' + event.subject + createEditButton(event.id, 'event', 'subject', event.subject) +
        '</td><td>' + event.start.toString() + 
        '</td><td>' + event.end.toString() + '</td></tr>');
      altRow = !altRow;
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

function renderCalendarPageWithView(response, session) {
  var outlookClient = new outlook.Microsoft.OutlookServices.Client('https://outlook.office365.com/api/v1.0', 
    authHelper.getAccessTokenFn('https://outlook.office365.com/', session));
  
  response.writeHead(200, {"Content-Type": "text/html"});
  renderCommonElements(response, session);
  response.write('<div><span id="table-title">Your calendar</span></div>');
  response.write('<table class="item-list"><tr><th class="button"></th><th>Subject</th><th>Start</th><th>End</th></tr>');
  
  var altRow = false;
  
  var calId = "AAMkADNhMjcxM2U5LWY2MmItNDRjYy05YzgwLWQwY2FmMTU1MjViOABGAAAAAAC_IsPnAGUWR4fYhDeYtiNFBwCDgDrpyW-uTL4a3VuSIF6OAAAAAAEGAACDgDrpyW-uTL4a3VuSIF6OAAAAR19hAAA=";
  var viewFetcher = outlookClient.me.calendarView.getEvents();
  
  viewFetcher.addQuery("startDateTime=2015-03-04T05:00:00Z");
  viewFetcher.addQuery("endDateTime=2015-03-11T05:00:00Z");
  
  viewFetcher.fetch().then(function (result) {
    result.currentPage.forEach(function (event) {
      var rowClass = altRow ? "alt" : "normal";
      response.write('<tr class="' + rowClass + '"><td class="button">' + createDeleteButton(event.id, 'event') + 
        '</td><td>' + event.subject + createEditButton(event.id, 'event', 'subject', event.subject) +
        '</td><td>' + event.start.toString() + 
        '</td><td>' + event.end.toString() + '</td></tr>');
      altRow = !altRow;
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

function renderContactsPage(response, session) {
  var outlookClient = new outlook.Microsoft.OutlookServices.Client('https://outlook.office365.com/api/v1.0', 
    authHelper.getAccessTokenFn('https://outlook.office365.com/', session));
  
  response.writeHead(200, {"Content-Type": "text/html"});
  renderCommonElements(response, session);
  response.write('<div><span id="table-title">Your contacts</span></div>');
  response.write('<table class="item-list"><tr><th class="button"></th><th>Given Name</th><th>Surname</th><th>Email</th><th>Mobile Phone</th></tr>');
  
  var altRow = false;
  
  outlookClient.me.contacts.getContacts().orderBy('DisplayName asc').fetch().then(function (result) {
    result.currentPage.forEach(function (contact) {
      var rowClass = altRow ? "alt" : "normal";
      var emailAddress = contact.emailAddresses.item(0);
      var email = emailAddress ? emailAddress.address : "NONE";
      var mobile = contact.mobilePhone1 ? contact.mobilePhone1 : "NONE";
      response.write('<tr class="' + rowClass + '"><td class="button">' + createDeleteButton(contact.id, 'contact') +
        '</td><td>' + contact.givenName + 
        '</td><td>' + contact.surname + 
        '</td><td>' + email + 
        '</td><td>' + mobile + createEditButton(contact.id, 'contact', 'mobilePhone1', mobile) + '</td></tr>');
      altRow = !altRow;
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

function renderEditFieldPage(response, session, itemType, itemId, fieldName, value) {
  response.writeHead(200, {"Content-Type": "text/html"});
  renderCommonElements(response, session);
  
  response.write('<div><span id="table-title">Editing ' + fieldName + '</span></div>');
  response.write('<form action="/update" method="POST">');
  response.write('<label for="value">' + fieldName + '</label><br>');
  response.write('<input class="item-field" type="text" name="value" id="value" value="' + value + '" /><br>');
  response.write('<input type="hidden" name="itemType" value="' + itemType + '" />');
  response.write('<input type="hidden" name="itemId" value="' + itemId + '" />');
  response.write('<input type="hidden" name="fieldName" value="' + fieldName + '" />');
  response.write('<input type="submit" value="Save Changes" />');
  
  writeSession(response, session);
  response.end();
}

function renderCommonElements(response, session) {
  response.write('<head>');
  response.write('<link href="./css/styles.css" rel="stylesheet">')
  response.write('</head>');
  
  response.write('<div id="info-bar">');
  response.write('<span id="app-title"><a class="nav" href="/"><strong>node-mail sample app</strong></a></span>');
  response.write('<span id="nav-links"><a class="nav" href="/mail">mail</a>');
  response.write('<a class="nav" href="/calendar">calendar</a>');
  response.write('<a class="nav" href="/contacts">contacts</a></span>');
  if (session.isLoggedIn()) {
    
    response.write('<span id="logout">' + session.userName + '<a class="nav" href="./logout">logout</a></span>');
  }
  response.write('</div>');
}

function createDeleteButton(itemId, itemType) {
  var deleteUri = '/delete?' + querystring.stringify({itemId: itemId, itemType: itemType});
  var buttonElement = '<a class="action" href="' + deleteUri + '">Delete</a>';
  return buttonElement;
}

function createEditButton(itemId, itemType, fieldName, value) {
  var editUri = '/edit?' + querystring.stringify({itemId: itemId, itemType: itemType, fieldName: fieldName, value: value});
  var buttonElement = '<a class="action" href="' + editUri + '">Change</a>';
  return buttonElement;
}

function serveCss(response, request) {
  fs.readFile("css/styles.css", function(err, page){
    response.writeHead(200, {'Content-Type': 'text/css'});
    response.write(page);
    response.end();
  });
}

function redirectTo(response, redirectUrl) {
  console.log("Redirecting to:", redirectUrl);
  response.writeHead(302, {"Location": redirectUrl});
  response.end();
}

exports.home = home;
exports.mail = mail;
exports.calendar = calendar;
exports.contacts = contacts;
exports.deleteItem = deleteItem;
exports.editField = editField;
exports.updateItem = updateItem;
exports.authorize = authorize;
exports.logout = logout;
exports.serveCss = serveCss;

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
