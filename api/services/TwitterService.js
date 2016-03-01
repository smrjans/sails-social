var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var Twit = require('twit');
//var User = sails.models.user;
var apiKey = sails.config.passport.twitter.options.consumerKey;
var apiSecret = sails.config.passport.twitter.options.consumerSecret;
var accessToken = sails.config.connections.twitter.consumerSecret;
var accessTokenSecret = sails.config.connections.twitter.consumerSecret;
export class TwitterService {
    twitter(username) {
        return __awaiter(this, void 0, Promise, function* () {
            User.find({ name: username }).populateAll().exec((err, users) => {
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
            });
        });
    }
    find(username, collectionName, options) {
        return __awaiter(this, void 0, Promise, function* () {
            sails.log.debug('username >> ', username);
            sails.log.debug('collectionName >> ', collectionName);
            sails.log.debug('options >> ', options);
            // for now, only use the "where" part of the criteria set
            var criteria = options.where || {};
            var twitter = yield this.twitter(username);
            switch (collectionName) {
                case 'trendsPlace': return this.trendsPlace(twitter, criteria);
                case 'trends': return this.trends(twitter, criteria);
                case 'tweets': return this.tweets(twitter, criteria);
                case 'timeline': return this.timeline(twitter, criteria);
                case 'lookup': return this.lookup(twitter, criteria);
                //case 'user' : return this.searchUsers(twitter, criteria, searchCriteria, confidenceCriteria, afterwards);
                default: return null; //this.rest(twitter, collectionName, criteria);
            }
        });
    }
    tweets(twitter, criteria) {
        return __awaiter(this, void 0, Promise, function* () {
            return yield twitter.get('search/tweets', criteria);
        });
    }
    trendsPlace(twitter, criteria) {
        return __awaiter(this, void 0, Promise, function* () {
            return yield twitter.get('trends/place', {
                id: criteria.id || 1
            });
        });
    }
    trends(twitter, criteria) {
        return __awaiter(this, void 0, Promise, function* () {
            return yield twitter.get('trends/closest', {
                lat: criteria.lat || 0,
                long: criteria.long || 0
            });
        });
    }
    timeline(twitter, criteria) {
        return __awaiter(this, void 0, Promise, function* () {
            console.log('getting timeline data for user: ', criteria);
            if (criteria.limit)
                criteria.count = criteria.limit;
            return yield twitter.get('statuses/user_timeline', criteria);
        });
    }
    lookup(twitter, criteria) {
        return __awaiter(this, void 0, Promise, function* () {
            console.log('looking up users: ', criteria);
            return yield twitter.get('users/lookup', criteria);
        });
    }
    /**
     *Search for users
     *
     */
    searchUsers(username, criteria, searchCriteria, confidenceCriteria) {
        return __awaiter(this, void 0, Promise, function* () {
            sails.log.debug("search_criteria ++++++ " + searchCriteria.description);
            var twitter = yield this.twitter(username);
            var result = yield twitter.get('users/search', criteria);
            return this.calculateConfidence(result, searchCriteria, confidenceCriteria);
        });
    }
    /**
     * calculate Confidence Score
     **/
    calculateConfidence(users, search_criteria, confidenceCriteria) {
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
    }
    splitString(searchCriteria, userName) {
        var splitCriteria = searchCriteria.split(" ");
        splitCriteria.forEach(function (individualSearch, index) {
            return userName.indexOf(individualSearch) > -1 ? true : false;
        });
    }
}
module.exports = new TwitterService();
