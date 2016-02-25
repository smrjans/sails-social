var Twit = require('twit');
var sails = require('sails');
//var User = require('user');

var apiKey = sails.config.passport.twitter.options.consumerKey;
var apiSecret = sails.config.passport.twitter.options.consumerSecret;
var accessToken = sails.config.connections.twitter.consumerSecret;
var accessTokenSecret = sails.config.connections.twitter.consumerSecret;

export class TwitterService{
  twitter(username, cb) {
    //noinspection TypeScriptUnresolvedVariable
    User.find({name: username}).populateAll().exec((err, users) => {
      if (err) {
        sails.log('Invalid user', user);
        return null;
      }
      sails.log('Wow, there are %d users named Finn.  Check it out:', users.length, users);
      if (!users || !users.length) {
        sails.log("No such user found");
      }
      var user = users[0];
      if (!user || !user.passports || !user.passports.length) {
        sails.log('Invalid user', user);
        return null;
      }
      var passport = user.passports[user.passports.length - 1];
      var twitter = new Twit({
        consumer_key: apiKey,
        consumer_secret: apiSecret,
        access_token: passport.tokens.token,
        access_token_secret: passport.tokens.tokenSecret,
        timeout_ms: 60 * 1000
      });
      return cb(twitter);
    });
 }

  find(username, collectionName, options, cb) {
    var _this = this;
    sails.log('username >> ', username);
    sails.log('collectionName >> ', collectionName);
    sails.log('options >> ', options);
    // for now, only use the "where" part of the criteria set
    var criteria = options.where || {};
    this.twitter(username, twitter => {
      switch (collectionName) {
        case 'location'	: return _this.trendingPlaces(twitter, criteria, afterwards);
        case 'trend'	: return _this.trends(twitter, criteria, afterwards);
        case 'tweet'	: return _this.searchTweets(twitter, criteria, afterwards);
        case 'timeline' : return _this.timeline(twitter, criteria, afterwards);
        case 'lookup' : return _this.lookup(twitter, criteria, afterwards);
        default: return _this.api(twitter, collectionName, criteria, afterwards);
      }
    });

    function afterwards (err, results) {
      if (err) return cb(err);
      if (options.limit) return cb(null, results.first(options.limit));

      return cb(err,results);
    }
 }

  searchTweets(twitter, criteria, cb) {
    twitter.get('search/tweets', criteria, (err, result:any)=> {
      if (err) return cb(err);
      if (!(result && result.statuses) ) return cb(result);
      cb(err, result.statuses);
    });
 }

  trends(twitter, criteria, cb) {
    twitter.get('trends/place', {
      id: criteria.id || 1
   }, (err, result) => {
      if (err) return cb(err);
      if (!(result[0] && result[0].trends) ) return cb(result);
      cb(err, result[0].trends);
    });
 }

  trendingPlaces(twitter, criteria, cb) {
    twitter.get('trends/closest', {
      lat: criteria.lat || 0,
      long: criteria.long || 0
   }, cb);
 }

  timeline(twitter, criteria, cb) {
    console.log('getting timeline data for user: ', criteria);
    if (criteria.limit) criteria.count = criteria.limit;

    twitter.get('statuses/user_timeline', criteria, (err, result) => {
      if (err) return cb(err, null);
      if (!(result && result)) return cb(result);
      cb(err, result);
    });
 }

  lookup(twitter, criteria, cb) {
    console.log('looking up users: ', criteria);

    twitter.get('users/lookup', criteria, (err, result) => {
      if (err) return cb(err, null);
      if (!(result && result)) return cb(result);
      cb(err, result);
    });
 }

  api(twitter, api, criteria, cb) {
    console.log('looking up: '+api+' with: ', criteria);

    twitter.get(api, criteria, (err, result) => {
      if (err) return cb(err, null);
      if (!(result && result)) return cb(result);
      cb(err, result);
    });
  }
}

module.exports = new TwitterService();
