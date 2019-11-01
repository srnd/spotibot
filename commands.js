const config = require('./config.json');

module.exports = function(bot, spotify){
  // fallback, adds songs
  bot.addCommand("@"+config.followUsername, "fuck", function(message, args, channel, username, extra){
    if(message.indexOf("sandstorm") !== -1 || message.indexOf("darude") !== -1){
      bot.sendMessage("@" + username + " DUDUDUDU DUDUDU DUDUDUDUDU DUDUDUDU", extra.tweet.id_str);
    }else{
      spotify.searchTracks(message).then(function(data){
        var track = data.body.tracks.items[0];
        if(data.body.tracks.total <= 0){
          bot.sendMessage("Sorry, @" + username + "... I don't know that one.", extra.tweet.id_str);
        }else{
          trackInPlaylist(track, function(inPlaylist){
            if(inPlaylist){
              bot.sendMessage("Sorry, @" + username + "... that song is already queued up!", extra.tweet.id_str);
            }else if(track.explicit || artistBlacklisted(track.artists)){
              bot.sendMessage("Sorry, @" + username + "... I don't like that one.", extra.tweet.id_str);
            }else{
              spotify.addTracksToPlaylist(config.playlistUsername, config.playlistId, [track.uri])
                .then(function() {
                  bot.sendMessage(randomGreeting("addSong") + ", @" + username + "! I've added " + track.name + " to the queue.", extra.tweet.id_str);
                });
            }
          });
        }
      });
    }
  });

  var greetings = {
    generic: [
      "Hi",
      "Yo",
      "Sup",
      "Ayy lmao"
    ],
    addSong: [
      "Nice track",
      "I love that song",
      "Awesome choice",
      "This is my jam",
      "Couldn't have picked better",
      "ayy lmao"
    ]
  };

  var artistBlacklist = [
    // Rick Astley
    "0gxyHStUsqpMadRV0Di1Qt",
    // Childish Gambino
    "73sIBHcqh3Z3NyqHKZ7FOL"
    // Justin Bieber
    // "1uNFoZAHBGtllmzznpCI3s"
  ];

  function trackInPlaylist(track, callback){
    spotify.getPlaylist('tjahorner', '1Fp5ttUL53JtNiHJY5cVi8')
      .then(function(data) {
        var tracks = data.body.tracks.items;
        var inPlaylist = false;
        for(var i=0; i<tracks.length; i++){
          if(tracks[i].track.id === track.id)
            inPlaylist = true;
        }
        callback(inPlaylist);
      });
  }

  function randomGreeting(category){
    return greetings[category][Math.floor(Math.random() * greetings[category].length)];
  }

  function artistBlacklisted(artists){
    var blacklisted = false;
    for(var i=0; i<artists.length; i++){
      if(artistBlacklist.indexOf(artists[i].id) !== -1)
        blacklisted = true;
    }
    return blacklisted;
  }
};
