/**
 * TwitterController
 *
 * @description :: Server-side logic for managing twitters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

global.confidenceCriteria;
module.exports = {

  timeline: function(req, res){
    //Use the Waterline syntax

      var criteria = {
        where: req.query
      };
      if(!criteria.where.screen_name) {
        criteria.where.screen_name = 'gorelative';
      }

      TwitterService.find(req.params[0], 'timeline', criteria, function (err, result) {
        if (err) {
          sails.log.error(err);
          res.send(err.statusCode);
        } else {
          sails.log.debug('search/user_timeline result, ', result);
          res.send(result);
        }
      });
  },

  search: function(req, res){
      var criteria = {
        where: {
          q:req.body.name[0],
          count: req.query.count || req.params.count
        }
      };
      var search_criteria = {
        name:req.body.name[0],
        location:req.body.location[0],
        screenName:req.body.screenName[0],
        description:req.body.description[0]
      };

      TwitterService.find(req.params[0], 'user',search_criteria,global.confidenceCriteria,criteria, function (err, result) {
        if (err) {
          sails.log.error(err);
          res.send(err.statusCode);
        } else {
          return res.view({ 
              users : result
          });
        }

      });
  },

  searchCriteria: function(req, res){
      global.confidenceCriteria = {
        name:Number(req.body.name[0]),
        location:Number(req.body.location[0]),
        screenName:Number(req.body.screenName[0]),
        description:Number(req.body.description[0]),
        name_partialFactor:Number(req.body.name[1]),
        location_partialFactor:Number(req.body.location[1]),
        screenName_partialFactor:Number(req.body.screenName[1]),
        description_partialFactor:Number(req.body.description[1])

      };
      

      return res.view({ 
        user:global.loggedInProfile._json
      });
  },

  lookup: function(req, res){

      var criteria = {
        where: req.query
      };
      if(!criteria.where.screen_name) {
        criteria.where.screen_name = 'gorelative';
      }
      sails.log.debug(criteria);

      TwitterService.find(req.params[0], 'lookup', criteria, function (err, result) {
        if (err) {
          sails.log.error(err);
          res.send(err.statusCode);
        } else {
          sails.log.debug('user/lookup result, ', result);
          res.send(result);
        }

      });
  },

  rest: function(req, res){

    var criteria = {
      where: req.query
    };
    if(!criteria.where.screen_name) {
      criteria.where.screen_name = 'gorelative';
    }
    sails.log.debug(criteria);

    sails.log.debug('username: '+req.params[0]);
    sails.log.debug('api: '+req.query.api);

    TwitterService.find(req.params[0], req.query.api, criteria, function (err, result) {
      if (err) {
        sails.log.error(err);
        res.send(err.statusCode);
      } else {
        sails.log.debug(req.params[1]+' result, ', result);
        res.send(result);
      }

    });
  }
};

