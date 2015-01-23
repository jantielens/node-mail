function Session() {
  this.sessionId = generateUUID();
  this.accessToken = "";
  this.refreshToken = "";
  this.tokenExpires = new Date();
  
  this.toString = function() {
    return this.sessionId;
  }
  
  this.updateTokens = function(tokenInfo) {
    console.log("updateTokens called for " + this.sessionId);
    this.accessToken = tokenInfo.access_token;
    this.refreshToken = tokenInfo.refresh_token;
    this.tokenExpires = new Date(tokenInfo.expires_on * 1000);
    
    console.log("Access token: " + this.accessToken);
    console.log("Refresh token: " + this.refreshToken);
    console.log("Expires: " + this.tokenExpires);
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

exports.Session = Session;