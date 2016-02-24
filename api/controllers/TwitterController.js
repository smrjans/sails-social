/**
 * TwitterController
 *
 * @description :: Server-side logic for managing twitters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  timeline: function(req, res){
    //Use the Waterline syntax
    var criteria = {
      where: req.query
    };

    if(!criteria.where.screen_name) {
      criteria.where.screen_name = 'gorelative';
    }

    User.find({name:req.params[0]}).populateAll().exec(function (err, users) {
      if (err) {
        return res.negotiate(err);
      }
      sails.log('Wow, there are %d users named Finn.  Check it out:', users.length, users);
      if(!users || !users.length) {
        res.send("No such user found");
      }

      TwitterService.find(users[0], 'timeline', criteria, function (err, result) {
        if (err) {
          sails.log.error(err);
          res.send(err.statusCode);
        } else {
          sails.log.debug('search/user_timeline result, ', result);
          res.send(result);
        }
      });
    });
  },

  search: function(req, res){
    var criteria = {
      where: {
        q: req.query.q || req.params.query,
        count: req.query.count || req.params.count
      }
    };

    User.find({name:req.params[0]}).populateAll().exec(function (err, users) {
      if (err) {
        return res.negotiate(err);
      }
      sails.log('Wow, there are %d users named Finn.  Check it out:', users.length, users);
      if (!users || !users.length) {
        res.send("No such user found");
      }
      sails.log.debug(criteria);

      TwitterService.find(users[0], 'tweet', criteria, function (err, result) {
        if (err) {
          sails.log.error(err);
          res.send(err.statusCode);
        } else {
          sails.log.debug('search/tweets result, ', result);
          res.send(result);
        }

      });
    });
  }
};

