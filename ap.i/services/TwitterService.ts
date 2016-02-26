import {Sails, Model} from "sails";
var Twit = require('twit');
//var sails = require('sails');

declare var sails: Sails;
declare var User: Model;
//var User = sails.models.user;
var apiKey = sails.config.passport.twitter.options.consumerKey;
var apiSecret = sails.config.passport.twitter.options.consumerSecret;
var accessToken = sails.config.connections.twitter.consumerSecret;
var accessTokenSecret = sails.config.connections.twitter.consumerSecret;

export class TwitterService{
  twitter(username, cb) {
    User.find({name: username}).populateAll().exec((err, users) => {
      if (err) {
        sails.log.error('Invalid user', user);
        return null;
      }
      sails.log.info('Wow, there are %d users named Finn.  Check it out:', users.length, users);
      if (!users || !users.length) {
        sails.log.error("No such user found");
      }
      var user = users[0];
      if (!user || !user.passports || !user.passports.length) {
        sails.log.error('Invalid user', user);
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
    sails.log.debug('username >> ', username);
    sails.log.debug('collectionName >> ', collectionName);
    sails.log.debug('options >> ', options);
    // for now, only use the "where" part of the criteria set
    var criteria = options.where || {};
    this.twitter(username, twitter => {
      switch (collectionName) {
        case 'trendsPlace'	: return this.trendsPlace(twitter, criteria, afterwards);
        case 'trends'	: return this.trends(twitter, criteria, afterwards);
        case 'tweets'	: return this.tweets(twitter, criteria, afterwards);
        case 'timeline' : return this.timeline(twitter, criteria, afterwards);
        case 'lookup' : return this.lookup(twitter, criteria, afterwards);
        default: return this.rest(twitter, collectionName, criteria, afterwards);
      }
    });

    function afterwards (err, results) {
      if (err) return cb(err);
      if (options.limit) return cb(null, results.first(options.limit));

      return cb(err,results);
    }
 }

  tweets(twitter, criteria, cb) {
    twitter.get('search/tweets', criteria, (err, result:any)=> {
      if (err) return cb(err);
      if (!(result && result.statuses) ) return cb(result);
      cb(err, result.statuses);
    });
 }

  trendsPlace(twitter, criteria, cb) {
    twitter.get('trends/place', {
      id: criteria.id || 1
   }, (err, result) => {
      if (err) return cb(err);
      if (!(result[0] && result[0].trends) ) return cb(result);
      cb(err, result[0].trends);
    });
 }

  trends(twitter, criteria, cb) {
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

  rest(twitter, api, criteria, cb) {
    console.log('looking up: '+api+' with: ', criteria);

    twitter.get(api, criteria, (err, result) => {
      if (err) return cb(err, null);
      if (!(result && result)) return cb(result);
      cb(err, result);
    });
  }
}

module.exports = new TwitterService();
