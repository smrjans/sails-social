import {TwitterService} from "../services/TwitterService";
import {Twitter} from "../models/Twitter";
import {Request} from "sails";
import {Response} from "sails";
import {Sails} from "sails";


/**
 * TwitterController
 *
 * @description :: Server-side logic for managing twitters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var twitterService: TwitterService = require("../services/TwitterService");
declare var sails: Sails;
var twitter: Twitter = require('../models/Twitter');

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
        //noinspection TypeScriptUnresolvedVariable
        sails.log.error(err);
        res.send(err.statusCode);
      } else {
        sails.log.debug('search/user_timeline result, ', result);
        res.send(result);
      }
    });
  }

  tweets(req, res){
    var criteria = {
      where: {
        q: req.query.q || req.params.query,
        count: req.query.count || req.params.count
      }
    };
    sails.log.debug(criteria);

    twitterService.find(req.params[0], 'tweets', criteria, (err, result)=> {
      if (err) {
        sails.log.error(err);
        res.send(err.statusCode);
      } else {
        sails.log.debug('search/tweets result, ', result);
        res.send(result);
      }

    });
  }

  lookup(req: Request, res: Response){
    //twitter.find();
    var criteria = {
      where: req.query
    };
    if(!criteria.where.screen_name) {
      criteria.where.screen_name = 'D_Asterra';
    }
    sails.log.debug(criteria);
    sails.log.debug("twitterService >> "+twitterService);

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

}

module.exports = new TwitterController();
