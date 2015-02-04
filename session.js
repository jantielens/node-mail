// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
function Session() {
  this.sessionId = generateUUID();
  this.token;
  this.userName;
  
  this.toString = function() {
    return this.sessionId;
  }
  
  this.updateTokens = function(token) {
    console.log("updateTokens called for " + this.sessionId);
    this.token = token;
    var idToken = parseIdToken(token.token.id_token);
    this.userName = idToken.name;
  }
  
  this.isLoggedIn = function() {
    if (this.token) {
      return true;
    }
    return false;
  }
  
  this.logout = function() {
      this.token = null;
      this.userName = "";
  }
}

function generateUUID(){
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};

function parseIdToken(idToken) {
   console.log("parseIdToken called with", idToken);
   // Split the token into its parts. Parts are separated
   // by a '.'.
   var tokenParts = idToken.split('.');
   // The first part is the header, which we don't care about
   // The second part is the actual payload, which we do care about
   var payload = tokenParts[1];
   console.log("Split results:", payload);
   console.log("LENGTH:", payload.length);
   
   // The payload is base64-encoded, so decode it.
   var decodedPayload = new Buffer(payload, 'base64').toString('utf8');
   console.log("Decoded:", decodedPayload);
   
   // Now just JSON parse it
   var jsonToken = JSON.parse(decodedPayload);
   console.log("Name:", jsonToken.name);
   console.log("Email:", jsonToken.upn);
   return jsonToken;
}

exports.Session = Session;

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