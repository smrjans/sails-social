import {Sails, Model} from "sails";
import {Async} from "asyncawait";
import {Await} from "asyncawait";
import {Promise} from "asyncawait";

var _ = require('lodash');

var Twit = require('bluebird').promisifyAll(require('twit'));
//var sails = require('sails');
var async: Async = require('asyncawait/async');
var await: Await = require('asyncawait/await');

declare var sails: Sails;
declare var User: Model;
declare var Q;
//var User = sails.models.user;
var apiKey = sails.config.passport.twitter.options.consumerKey;
var apiSecret = sails.config.passport.twitter.options.consumerSecret;
var accessToken = sails.config.connections.twitter.consumerSecret;
var accessTokenSecret = sails.config.connections.twitter.consumerSecret;

export class TwitterService{
  twitter(username): Promise<any> {
    return async(username=>{
      await(User.find({name: username}).populateAll().exec((err, users) => {
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
        return twitter;
      }));
    })(username);
  }

  find(username, collectionName, options){
    return async((username, collectionName, options)=> {
      if(!username) username = "smrsahu";
      sails.log.debug('username >> ', username);
      sails.log.debug('collectionName >> ', collectionName);
      sails.log.debug('options >> ', options);

      // for now, only use the "where" part of the criteria set
      var criteria = options.where || {};
      var twitter = await(this.twitter(username));
      sails.log.debug('twitter >> ', twitter);

      switch (collectionName) {
        case 'trendsPlace'  :
          return await(this.trendsPlace(twitter, criteria));
        case 'trends'  :
          return await(this.trends(twitter, criteria));
        case 'tweets'  :
          return await(this.tweets(twitter, criteria));
        case 'timeline' :
          return await(this.timeline(twitter, criteria));
        case 'lookup' :
          return await(this.lookup(twitter, criteria));
        //case 'user' : return this.searchUsers(twitter, criteria, searchCriteria, confidenceCriteria, afterwards);
        default:
          return await(this.timeline(twitter, criteria));
          //return null; //this.rest(twitter, collectionName, criteria);
      }
    })(username, collectionName, options);
  }

  tweets(twitter, criteria) {
    return async((twitter, criteria)=>{
      return await(twitter.get('search/tweets', criteria));
    })(twitter, criteria);
  }

  trendsPlace(twitter, criteria)  {
    return async((twitter, criteria)=>{
      return await(twitter.get('trends/place', {
        id: criteria.id || 1
      }));
    })(twitter, criteria);
  }

  trends(twitter, criteria) {
    return async((twitter, criteria)=> {
      return await(twitter.get('trends/closest', {
        lat: criteria.lat || 0,
        long: criteria.long || 0
      }));
    })(twitter, criteria);
  }

  timeline(twitter, criteria) {
    return async((twitter, criteria)=> {
      console.log('getting timeline data for user: ', criteria);
      if (criteria.limit) criteria.count = criteria.limit;

      return await(twitter.get('statuses/user_timeline', criteria));
    })(twitter, criteria);
  }

  lookup(twitter, criteria) {
    return async((twitter, criteria)=> {
      console.log('looking up users: ', criteria);
      return await(twitter.get('users/lookup', criteria));
    })(twitter, criteria);
  }

  /**
   *Search for users
   *
   */
  searchUsers(username, criteria,searchCriteria,confidenceCriteria) {
    return async((username, criteria,searchCriteria,confidenceCriteria)=> {
      sails.log.debug("search_criteria ++++++ " + searchCriteria.description);
      var twitter = await(this.twitter(username));
      var result = await(twitter.get('users/search', criteria));
      return this.calculateConfidence(result, searchCriteria, confidenceCriteria);
    })(username, criteria,searchCriteria,confidenceCriteria);
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
