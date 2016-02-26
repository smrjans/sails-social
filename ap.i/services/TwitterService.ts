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
        //case 'user' : return this.searchUsers(twitter, criteria, searchCriteria, confidenceCriteria, afterwards);
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

  /**
   *Search for users
   *
   */
  searchUsers(username, criteria,searchCriteria,confidenceCriteria,cb) {
    sails.log.debug("search_criteria ++++++ "+searchCriteria.description);
    this.twitter(username, twitter => {
      twitter.get('users/search', criteria, function (err, result) {
        if (err) return cb(err, null);
        if (!(result && result)) return cb(result);
        var finalData = this.calculateConfidence(result, searchCriteria, confidenceCriteria);
        cb(err, finalData);
      });
    });
  }

  /**
   * calculate Confidence Score
   **/
  calculateConfidence(users,search_criteria,confidenceCriteria){
    var total=confidenceCriteria.name+confidenceCriteria.location+confidenceCriteria.description+confidenceCriteria.screenName;

    for (var i = users.length - 1; i >= 0; i--) {
      var confidence=0;
      if(users[i].name.match(search_criteria.name)){
        confidence=confidence+confidenceCriteria.name;
      }else if (this.splitString(search_criteria.name,users[i].name)){
        confidence=confidence+(confidenceCriteria.name*confidenceCriteria.name_partialFactor);
      }

      if(users[i].location.match(search_criteria.location)){
        confidence=confidence+confidenceCriteria.location;
      }else if (this.splitString(search_criteria.name,users[i].name)){
        confidence=confidence+(confidenceCriteria.location*confidenceCriteria.location_partialFactor);
      }

      if(users[i].screen_name.match(search_criteria.screenName)){
        confidence=confidence+confidenceCriteria.screenName;
      }else if (this.splitString(search_criteria.name,users[i].name)){
        confidence=confidence+(confidenceCriteria.screenName*confidenceCriteria.screenName_partialFactor);
      }

      if(users[i].description.match(search_criteria.description)){
        confidence=confidence+confidenceCriteria.description;
      }else if (this.splitString(search_criteria.name,users[i].name)){
        confidence=confidence+(confidenceCriteria.description*confidenceCriteria.description_partialFactor);
      }

      users[i].score=(confidence/total)*100;
    }
    /*Sort in Desending Order*/
    users.sort(function(a, b) {
      return parseFloat(b.score) - parseFloat(a.score);
    });
    return users;
  }

  splitString(searchCriteria, userName){
    var splitCriteria = searchCriteria.split(" ");
    splitCriteria.forEach(function (individualSearch, index){
      return userName.indexOf(individualSearch) > -1 ? true : false;
    });
  }
}

module.exports = new TwitterService();
