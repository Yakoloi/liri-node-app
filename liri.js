var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var keys = require("./keys.js");
var liriCmd = process.argv[2];
var nodeArgs = process.argv;
var searchString = "";
var request = require('request');
var fs = require("fs");
var params = {
  screen_name: 'Yakoloi'
};

for (var i = 3; i < nodeArgs.length; i++) {
  searchString = searchString + "+" + nodeArgs[i];
}
searchString = searchString.slice(1);

var spotify = new Spotify({
  id: keys.spotifyKeys.consumer_key,
  secret: keys.spotifyKeys.consumer_secret
});

var client = new Twitter({
  consumer_key: keys.twitterKeys.consumer_key,
  consumer_secret: keys.twitterKeys.consumer_secret,
  access_token_key: keys.twitterKeys.access_token_key,
  access_token_secret: keys.twitterKeys.access_token_secret
});

var queryUrl = "http://www.omdbapi.com/?t=" + searchString + "&apikey=40e9cece";

switch (liriCmd) {
  case "my-tweets":
    myTweets();
    break;

  case "spotify-this-song":
    spotifySong();
    break;

  case "movie-this":
    lookupMovie();
    break;

  case "do-what-it-says":
    doWhatItSays();
    break;
}

function myTweets() {
  var mytweets = client.get('statuses/user_timeline', params, function (error, tweets, response) {
    if (!error) {
      console.log(tweets[0].text);
    }
  });
}

function lookupMovie() {
  if (searchString === "") {
    console.log("If you haven't watched Mr. Nobody, then you should: <http://www.imdb.com/title/tt0485947/");
    console.log("It's on Netflix!");
  } else if (searchString != null) {
    request(queryUrl, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var movieName = JSON.parse(body).Title;
        var movieYear = JSON.parse(body).Year;
        var imdbRating = JSON.parse(body).Ratings[0].Value;
        // var rtRating = JSON.parse(body).Ratings[1].Value;
        var movieCountry = JSON.parse(body).Country;
        var movieLanguage = JSON.parse(body).Language;
        var movieActors = JSON.parse(body).Actors;
        var moviePlot = JSON.parse(body).Plot;
        console.log("Title: " + movieName);
        console.log("Release Year: " + movieYear);
        console.log("Actors: " + movieActors);
        console.log("Country: " + movieCountry);
        console.log("Language: " + movieLanguage);
        console.log("IMDB rating: " + imdbRating);
        if (JSON.parse(body).Ratings.length > 1) {
          console.log("Rotton Tomatoes rating: " + JSON.parse(body).Ratings[1].Value);
        }
        console.log("Plot: " + moviePlot);
      }
    });
  }
}

function spotifySong() {
  spotify.search({
      type: 'track',
      query: searchString,
      limit: 2
    })
    .then(function (response) {
      var artistName = response.tracks.items[0].artists[0].name;
      var songName = response.tracks.items[0].name;
      var albumName = response.tracks.items[0].album.name;
      console.log(artistName);
      console.log(songName);
      console.log(albumName);
      console.log(response.tracks.items[0].preview_url);
    })
    .catch(function (err) {
      console.log(err);
    });
}

function doWhatItSays() {
  fs.readFile("random.txt", "utf8", function (error, data) {
    var dataArr = data.split(",");
    var newArg = dataArr[0];
    if (newArg == "spotify-this-song") {
      searchString = dataArr[1];
      spotifySong();
    }
  });
}