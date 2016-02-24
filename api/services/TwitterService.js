var Twit = require('twit');

var apiKey = sails.config.passport.twitter.options.consumerKey;
var apiSecret = sails.config.passport.twitter.options.consumerSecret;
var accessToken = sails.config.connections.twitter.consumerSecret;
var accessTokenSecret = sails.config.connections.twitter.consumerSecret;

module.exports = {

    api: function (user) {
        if(!user || !user.passports || !user.passports.length){
          sails.log('Invalid user', user);
          return null;
        }
        var passport = user.passports[user.passports.length - 1];
        return new Twit({
          consumer_key: apiKey,
          consumer_secret: apiSecret,
          access_token: passport.tokens.token,
          access_token_secret: passport.tokens.tokenSecret,
          timeout_ms: 60*1000
        });
    },

    find: function (user, collectionName, options, cb) {
        sails.log('user >> ', user);
      sails.log('collectionName >> ', collectionName);
      sails.log('options >> ', options);
        // for now, only use the "where" part of the criteria set
        var criteria = options.where || {};
        var api = this.api(user);

        switch (collectionName) {
            case 'location'	: return this.trendingPlaces(api, criteria, afterwards);
            case 'trend'	: return this.trends(api, criteria, afterwards);
            case 'tweet'	: return this.searchTweets(api, criteria, afterwards);
            case 'timeline' : return this.timeline(api, criteria, afterwards);
            default: return afterwards('Unknown usage of find() with model ('+collectionName+') ');
        }

        function afterwards (err, results) {
            if (err) return cb(err);
            if (options.limit) return cb(null, _.first(results,options.limit));

            return cb(err,results);
        }
    },

    searchTweets: function (api, criteria, cb) {
        api.get('search/tweets', criteria, function (err, result) {
            if (err) return cb(err);
            if (!(result && result.statuses) ) return cb(result);
            cb(err, result.statuses);
        });
    },

    trends: function (api, criteria, cb) {
        api.get('trends/place', {
            id: criteria.id || 1
        }, function (err, result) {
            if (err) return cb(err);
            if (!(result[0] && result[0].trends) ) return cb(result);
            cb(err, result[0].trends);
        });
    },

    trendingPlaces: function (api, criteria, cb) {
        api.get('trends/closest', {
            lat: criteria.lat || 0,
            long: criteria.long || 0
        }, cb);
    },

    timeline: function(api, criteria, cb) {
        console.log('getting timeline data for user: ', criteria);
        if (criteria.limit) criteria.count = criteria.limit;

        api.get('statuses/user_timeline', criteria, function (err, result) {
            if (err) return cb(err, null);
            if (!(result && result)) return cb(result);
            cb(err, result);
        });
    }
};
