var Bot = require('./s4/bot'),
    bot = new Bot(),
    config = require('./config.json'),
    twitter = require('twitter')(config.twitter),
    Spotify = require('spotify-web-api-node'),
    spotify = new Spotify(config.spotify),
    SpotifyAuthenticator = require('./spotify/auth'),
    spotifyAuth = new SpotifyAuthenticator(config.spotify.clientId, config.spotify.clientSecret),
    express = require('express')(),
    open = require('open'),
    jf = require('jsonfile');

function refreshSpotifyToken(){
  console.log("Access token refresh requested...");
  spotifyAuth.refreshAccessToken(function(data){
    if(data.access_token){
      console.log("Done. Setting access token...");
      spotify.setAccessToken(data.access_token);

      setTimeout(refreshSpotifyToken, (data.expires_in * 1000));
    }else{
      console.log("Couldn't refresh access token... something might go wrong!");
    }
  });
}

function init(){
  // get twitter linked to the bot

  bot.on('sendMessage', function(message, replyTo){
    twitter.post('statuses/update', {status: message, in_reply_to_status_id: replyTo}, /* doesn't handle callbacks correctly, dammit */ function(){});
  });

  bot.on('unknownResponse', function(){
    // ayy lmao, annoying log messages gone
  });

  twitter.stream('statuses/filter', {track: '@CodeDaySpotibot'}, function(stream) {
    stream.on('data', function(tweet) {
      bot.processMessage(tweet.text, null, tweet.user.screen_name, {tweet: tweet});
    });

    stream.on('error', function(error) {
      console.error(error);
    });
  });

  require('./commands')(bot, spotify);
}

if(!config.spotify.refreshToken){
  console.log("To start the bot, you'll need to authenticate with Spotify. Opening your browser now.");

  open(spotifyAuth.getOauthURI());

  express.get('/', function(req, res){
    spotifyAuth.exchangeToken(req.query.code, function(data){
      if(data.access_token){
        spotify.setAccessToken(data.access_token);
        spotifyAuth.refreshToken = data.refresh_token;
        config.spotify.refreshToken = data.refresh_token;

        setTimeout(refreshSpotifyToken, (data.expires_in * 1000));

        jf.writeFile('./config.json', config, function(err){
          if(!err){
            console.log("Saved refresh token in config for next use.");
          }else{
            console.log("Couldn't save refresh token in config! You'll probably need to re-authenticate every time.");
          }
        });

        init();

        res.send("Spotify access token set, you may now close this page.");
        server.close();
      }else{
        res.send("Something went wrong, have you checked your config?");
      }
    });
  });

  var server = express.listen(3000);
}else{
  spotifyAuth.refreshToken = config.spotify.refreshToken;
  refreshSpotifyToken();
  init();
}
