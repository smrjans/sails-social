var Twit = require('twit');

var apiKey = sails.config.passport.twitter.options.consumerKey;
var apiSecret = sails.config.passport.twitter.options.consumerSecret;
var accessToken = sails.config.connections.twitter.consumerSecret;
var accessTokenSecret = sails.config.connections.twitter.consumerSecret;

module.exports = {

    twitter: function (username, cb) {
      User.find({name: username}).populateAll().exec(function (err, users) {
        if (err) {
          sails.log('Invalid user', user);
          return null;
        }
        sails.log('Wow, there are %d users named Finn.  Check it out:', users.length, users);
        if (!users || !users.length) {
          res.send("No such user found");
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
    },

    find: function (username, collectionName,search_criteria,confidenceCriteria,options, cb) {
      var _this = this;
      sails.log('username >> ', username);
      sails.log('collectionName >> ', collectionName);
      sails.log('options >> ', options);
      console.log("search_criteria ++++++ "+search_criteria.description);
      
     /* var confidenceCriteria = {
        name:3,
        location:3,
        screenName:3,
        description:1,
        partialFactor:0.5

      };*/
        // for now, only use the "where" part of the criteria set
        var criteria = options.where || {};
        this.twitter(username, function(twitter) {
          switch (collectionName) {
              case 'location'	: return _this.trendingPlaces(twitter, criteria, afterwards);
              case 'trend'	: return _this.trends(twitter, criteria, afterwards);
              case 'tweet'	: return _this.searchTweets(twitter, criteria, afterwards);
              case 'timeline' : return _this.timeline(twitter, criteria, afterwards);
              case 'lookup' : return _this.lookup(twitter, criteria, afterwards);
              case 'user' : return _this.searchUsers(twitter, criteria,search_criteria,confidenceCriteria,afterwards);
              default: return _this.api(twitter, collectionName, criteria, afterwards);
          }
        });

        function afterwards (err, results) {
            if (err) return cb(err);
            if (options.limit) return cb(null, _.first(results,options.limit));

            return cb(err,results);
        }
    },

    searchTweets: function (twitter, criteria, cb) {
        twitter.get('search/tweets', criteria, function (err, result) {
            if (err) return cb(err);
            if (!(result && result.statuses) ) return cb(result);
            cb(err, result.statuses);
        });
    },

    trends: function (twitter, criteria, cb) {
        twitter.get('trends/place', {
            id: criteria.id || 1
        }, function (err, result) {
            if (err) return cb(err);
            if (!(result[0] && result[0].trends) ) return cb(result);
            cb(err, result[0].trends);
        });
    },

    trendingPlaces: function (twitter, criteria, cb) {
        twitter.get('trends/closest', {
            lat: criteria.lat || 0,
            long: criteria.long || 0
        }, cb);
    },

    timeline: function(twitter, criteria, cb) {
        console.log('getting timeline data for user: ', criteria);
        if (criteria.limit) criteria.count = criteria.limit;

        twitter.get('statuses/user_timeline', criteria, function (err, result) {
            if (err) return cb(err, null);
            if (!(result && result)) return cb(result);
            cb(err, result);
        });
    },

    lookup: function(twitter, criteria, cb) {
        console.log('looking up users: ', criteria);

        twitter.get('users/lookup', criteria, function (err, result) {
          if (err) return cb(err, null);
          if (!(result && result)) return cb(result);
          cb(err, result);
        });
    },
    /**
    *Search for users
    *
    */
    searchUsers: function(twitter, criteria,search_criteria,confidenceCriteria,cb) {
        var _this = this;
        twitter.get('users/search', criteria, function (err, result) {
          if (err) return cb(err, null);
          if (!(result && result)) return cb(result);
          var finalData=_this.calculateConfidence(result, search_criteria, confidenceCriteria)
          cb(err, finalData);
        });
    },
    /**
    * calculate Confidence Score
    **/
    calculateConfidence : function(users,search_criteria,confidenceCriteria){
      console.log("No. of Users "+ users.length);
      var total=confidenceCriteria.name+confidenceCriteria.location+confidenceCriteria.description+confidenceCriteria.screenName;

      _splitString(search_criteria.name,users[1].name);

      for (var i = users.length - 1; i >= 0; i--) {
        var confidence=0;
        if(users[i].name.match(search_criteria.name)){
          confidence=confidence+confidenceCriteria.name;
        }else if ((users[i].name.indexOf(search_criteria.name) > -1) || (search_criteria.name.indexOf(users[i].name) > -1) ){
          confidence=confidence+(confidenceCriteria.name*confidenceCriteria.name_partialFactor);
        }

        if(users[i].location.match(search_criteria.location)){
          confidence=confidence+confidenceCriteria.location;
        }else if ((users[i].location.indexOf(search_criteria.location) > -1)||(search_criteria.location.indexOf(users[i].location) > -1)){
          confidence=confidence+(confidenceCriteria.location*confidenceCriteria.location_partialFactor);
        }

        if(users[i].screen_name.match(search_criteria.screenName)){
          confidence=confidence+confidenceCriteria.screenName;
        }else if ((users[i].screen_name.indexOf(search_criteria.screenName) > -1)||(search_criteria.screenName.indexOf(users[i].screen_name) > -1)){
          confidence=confidence+(confidenceCriteria.screenName*confidenceCriteria.screenName_partialFactor);
        }

        if(users[i].description.match(search_criteria.description)){
          confidence=confidence+confidenceCriteria.description;
        }else if ((users[i].description.indexOf(search_criteria.description) > -1)||(search_criteria.description.indexOf(users[i].description) > -1)){
          confidence=confidence+(confidenceCriteria.description*confidenceCriteria.description_partialFactor);
        }

        users[i].score=(confidence/total)*100;
        console.log("Total Score "+users[i].score);
        console.log("total "+total);
        console.log("Confidence "+confidence);
      }
      /*Sort in Desending Order*/
      users.sort(function(a, b) {
        return parseFloat(b.score) - parseFloat(a.score);
      });
      return users;
    },

    _splitString : function(searchCriteria, userName){
     var splitCriteria = searchCriteria.split(" ");
     splitCriteria.forEach(function (individualSearch, index){
      return userName.indexOf(individualSearch) > -1 ? true : false;
     });
    },
    api: function(twitter, api, criteria, cb) {
      console.log('looking up: '+api+' with: ', criteria);

      twitter.get(api, criteria, function (err, result) {
        if (err) return cb(err, null);
        if (!(result && result)) return cb(result);
        cb(err, result);
      });
    }
};
