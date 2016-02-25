import {TwitterService} from "../services/TwitterService";
/**
 * TwitterController
 *
 * @description :: Server-side logic for managing twitters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var twitterService: TwitterService = require("../services/TwitterService");

export class TwitterController {

  timeline(req, res){
    //Use the Waterline syntax

    var criteria = {
      where: req.query
    };
    if(!criteria.where.screen_name) {
      criteria.where.screen_name = 'D_Asterra';
    }

    twitterService.find(req.params[0], 'timeline', criteria, (err, result)=> {
      if (err) {
        sails.log.error(err);
        res.send(err.statusCode);
      } else {
        sails.log.debug('search/user_timeline result, ', result);
        res.send(result);
      }
    });
  }

  search(req, res){
    var criteria = {
      where: {
        q: req.query.q || req.params.query,
        count: req.query.count || req.params.count
      }
    };
    sails.log.debug(criteria);

    twitterService.find(req.params[0], 'tweet', criteria, (err, result)=> {
      if (err) {
        sails.log.error(err);
        res.send(err.statusCode);
      } else {
        sails.log.debug('search/tweets result, ', result);
        res.send(result);
      }

    });
  }

  lookup(req, res){

    var criteria = {
      where: req.query
    };
    if(!criteria.where.screen_name) {
      criteria.where.screen_name = 'D_Asterra';
    }
    sails.log.debug(criteria);

    twitterService.find(req.params[0], 'lookup', criteria, (err, result)=> {
      if (err) {
        sails.log.error(err);
        res.send(err.statusCode);
      } else {
        sails.log.debug('user/lookup result, ', result);
        res.send(result);
      }

    });
  }

  rest(req, res){

    var criteria = {
      where: req.query
    };
    if(!criteria.where.screen_name) {
      criteria.where.screen_name = 'D_Asterra';
    }
    sails.log.debug(criteria);

    sails.log.debug('username: '+req.params[0]);
    sails.log.debug('api: '+req.query.api);

    twitterService.find(req.params[0], req.query.api, criteria, (err, result)=> {
      if (err) {
        sails.log.error(err);
        res.send(err.statusCode);
      } else {
        sails.log.debug(req.params[1]+' result, ', result);
        res.send(result);
      }

    });
  }
}

module.exports = new TwitterController();
