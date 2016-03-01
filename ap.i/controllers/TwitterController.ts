import {Request} from "sails";
import {Response} from "sails";
import {Sails} from "sails";
import {Model} from "sails";
import {TwitterService} from "../services/TwitterService";
import {Async} from "asyncawait";
import {Await} from "asyncawait";
var async: Async = require('asyncawait/async');
var await: Await = require('asyncawait/await');

/**
 * TwitterController
 *
 * @description :: Server-side logic for managing twitters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var twitterService: TwitterService = require("../services/TwitterService");
var Promise = require('bluebird');
var _ = require('lodash');

declare var global: Global;
declare var sails: Sails;
declare var Twitter: Model;

export class TwitterController {

  search(req, res){
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
    twitterService.searchUsers(req.params[0], search_criteria,global['confidenceCriteria'],criteria).then(result =>{
      return res.view({
        users : result
      });
    }).catch(err =>{
      sails.log.error(err);
      res.send(err.statusCode);
    });
  }

  searchCriteria(req, res){
    global['confidenceCriteria'] = {
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
      user:global['loggedInProfile']._json
    });
  }

  timeline(req, res){
    //Use the Waterline syntax

    var criteria = {
      where: req.query
    };
    if(!criteria.where.screen_name) {
      criteria.where.screen_name = 'D_Asterra';
    }

    twitterService.find(req.params[0], 'timeline', criteria).then(result => {
      sails.log.debug('search/user_timeline result, ', result);
      res.send(result);
    }).catch(err =>{
      sails.log.error(err);
      res.send(err.statusCode);
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

    twitterService.find(req.params[0], 'tweets', criteria).then(result => {
      sails.log.debug('search/tweets result, ', result);
      res.send(result);
    }).catch(err =>{
      sails.log.error(err);
      res.send(err.statusCode);
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
    //sails.log.debug("twitterService >> "+twitterService);

    twitterService.find(req.params[0], 'lookup', criteria).then(result => {
      sails.log.debug('user/lookup result, ', result);
      res.send(result);
    }).catch(err =>{
      sails.log.error(err);
      res.send(err.statusCode);
    });
  }

}

module.exports = new TwitterController();
