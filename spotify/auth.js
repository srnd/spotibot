SpotifyAuthenticator = function(clientId, clientSecret){
  var unirest = require('unirest');

  this.clientId = clientId;
  this.clientSecret = clientSecret;
  this.refreshToken = "";

  var _get = function(endpoint, params, callback){
    unirest.get("https://accounts.spotify.com/api/" + endpoint)
    .query(params)
    .end(function(res) {
     if (res.error) {
       console.log(res.error);
       callback({});
     } else {
       callback(res.body);
     }
    });
  };

  var _post = function(endpoint, params, callback){
    unirest.post("https://accounts.spotify.com/api/" + endpoint)
    .send(params)
    .end(function(res) {
     if (res.error) {
       console.log(res.error);
       callback({});
     } else {
       callback(res.body);
     }
    });
  };

  this.getOauthURI = function(){
    // for all scopes
    return 'https://accounts.spotify.com/authorize?response_type=code&client_id=' + this.clientId + '&redirect_uri=http://127.0.0.1:3000/&scope=playlist-modify-public+playlist-modify-private+playlist-read-private+user-library-read+user-library-modify+user-read-private+user-read-birthdate+user-read-email+user-follow-read+user-follow-modify+playlist-read-collaborative'
  };

  this.exchangeToken = function(code, callback){
    _post("token", {
      code: code,
      grant_type: "authorization_code",
      // assume it's always local auth
      redirect_uri: "http://127.0.0.1:3000/",
      client_id: this.clientId,
      client_secret: this.clientSecret
    }, callback);
  };

  this.refreshAccessToken = function(callback){
    _post("token", {
      grant_type: "refresh_token",
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret
    }, callback);
  };
};

module.exports = SpotifyAuthenticator;
