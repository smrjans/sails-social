"use strict";
var _ = require('lodash');
var Twit = require('bluebird').promisifyAll(require('twit'));
//var sails = require('sails');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
//var User = sails.models.user;
var apiKey = sails.config.passport.twitter.options.consumerKey;
var apiSecret = sails.config.passport.twitter.options.consumerSecret;
var accessToken = sails.config.connections.twitter.consumerSecret;
var accessTokenSecret = sails.config.connections.twitter.consumerSecret;
var TwitterService = (function () {
    function TwitterService() {
    }
    TwitterService.prototype.twitter = function (username) {
        return async(function (username) {
            var deferred = Promise.defer();
            User.find({ username: username }).populateAll().exec(function (err, users) {
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
                deferred.resolve(twitter);
            });
            return deferred.promise;
        })(username);
    };
    TwitterService.prototype.find = function (username, collectionName, options) {
        var _this = this;
        return async(function (username, collectionName, options) {
            if (!username)
                username = "smrsahu";
            sails.log.debug('username >> ', username);
            sails.log.debug('collectionName >> ', collectionName);
            sails.log.debug('options >> ', options);
            // for now, only use the "where" part of the criteria set
            var criteria = options.where || {};
            var twitter = await(_this.twitter(username));
            sails.log.debug('twitter >> ', twitter);
            switch (collectionName) {
                case 'trendsPlace':
                    return await(_this.trendsPlace(twitter, criteria));
                case 'trends':
                    return await(_this.trends(twitter, criteria));
                case 'tweets':
                    return await(_this.tweets(twitter, criteria));
                case 'timeline':
                    return await(_this.timeline(twitter, criteria));
                case 'lookup':
                    return await(_this.lookup(twitter, criteria));
                //case 'user' : return this.searchUsers(twitter, criteria, searchCriteria, confidenceCriteria, afterwards);
                default:
                    return await(_this.timeline(twitter, criteria));
            }
        })(username, collectionName, options);
    };
    TwitterService.prototype.tweets = function (twitter, criteria) {
        return async(function (twitter, criteria) {
            return await(twitter.get('search/tweets', criteria));
        })(twitter, criteria);
    };
    TwitterService.prototype.trendsPlace = function (twitter, criteria) {
        return async(function (twitter, criteria) {
            return await(twitter.get('trends/place', {
                id: criteria.id || 1
            }));
        })(twitter, criteria);
    };
    TwitterService.prototype.trends = function (twitter, criteria) {
        return async(function (twitter, criteria) {
            return await(twitter.get('trends/closest', {
                lat: criteria.lat || 0,
                long: criteria.long || 0
            }));
        })(twitter, criteria);
    };
    TwitterService.prototype.timeline = function (twitter, criteria) {
        return async(function (twitter, criteria) {
            console.log('getting timeline data for user: ', criteria);
            if (criteria.limit)
                criteria.count = criteria.limit;
            return await(twitter.get('statuses/user_timeline', criteria));
        })(twitter, criteria);
    };
    TwitterService.prototype.lookup = function (twitter, criteria) {
        return async(function (twitter, criteria) {
            console.log('looking up users: ', criteria);
            return await(twitter.get('users/lookup', criteria));
        })(twitter, criteria);
    };
    /**
     *Search for users
     *
     */
    TwitterService.prototype.searchUsers = function (username, criteria, searchCriteria, confidenceCriteria) {
        var _this = this;
        return async(function (username, criteria, searchCriteria, confidenceCriteria) {
            sails.log.debug("search_criteria ++++++ " + searchCriteria.description);
            var twitter = await(_this.twitter(username));
            var result = await(twitter.get('users/search', criteria));
            return _this.calculateConfidence(result, searchCriteria, confidenceCriteria);
        })(username, criteria, searchCriteria, confidenceCriteria);
    };
    /**
     * calculate Confidence Score
     **/
    TwitterService.prototype.calculateConfidence = function (users, search_criteria, confidenceCriteria) {
        var total = confidenceCriteria.name + confidenceCriteria.location + confidenceCriteria.description + confidenceCriteria.screenName;
        for (var i = users.length - 1; i >= 0; i--) {
            var confidence = 0;
            if (users[i].name.match(search_criteria.name)) {
                confidence = confidence + confidenceCriteria.name;
            }
            else if (this.splitString(search_criteria.name, users[i].name)) {
                confidence = confidence + (confidenceCriteria.name * confidenceCriteria.name_partialFactor);
            }
            if (users[i].location.match(search_criteria.location)) {
                confidence = confidence + confidenceCriteria.location;
            }
            else if (this.splitString(search_criteria.name, users[i].name)) {
                confidence = confidence + (confidenceCriteria.location * confidenceCriteria.location_partialFactor);
            }
            if (users[i].screen_name.match(search_criteria.screenName)) {
                confidence = confidence + confidenceCriteria.screenName;
            }
            else if (this.splitString(search_criteria.name, users[i].name)) {
                confidence = confidence + (confidenceCriteria.screenName * confidenceCriteria.screenName_partialFactor);
            }
            if (users[i].description.match(search_criteria.description)) {
                confidence = confidence + confidenceCriteria.description;
            }
            else if (this.splitString(search_criteria.name, users[i].name)) {
                confidence = confidence + (confidenceCriteria.description * confidenceCriteria.description_partialFactor);
            }
            users[i].score = (confidence / total) * 100;
        }
        /*Sort in Desending Order*/
        users.sort(function (a, b) {
            return parseFloat(b.score) - parseFloat(a.score);
        });
        return users;
    };
    TwitterService.prototype.splitString = function (searchCriteria, userName) {
        var splitCriteria = searchCriteria.split(" ");
        splitCriteria.forEach(function (individualSearch, index) {
            return userName.indexOf(individualSearch) > -1 ? true : false;
        });
    };
    return TwitterService;
}());
exports.TwitterService = TwitterService;
module.exports = new TwitterService();
