import {Request} from "sails";
import {Response} from "sails";
import {Sails} from "sails";
import {Model} from "sails";
import {TwitterService} from "../services/TwitterService";


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

  async search(req, res){
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

    var result = twitterService.searchUsers(req.params[0], search_criteria,global['confidenceCriteria'],criteria);
    return res.view({
      users : result
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

  async timeline(req, res){
    //Use the Waterline syntax

    var criteria = {
      where: req.query
    };
    if(!criteria.where.screen_name) {
      criteria.where.screen_name = 'D_Asterra';
    }

    var result = await twitterService.find(req.params[0], 'timeline', criteria);
    sails.log.debug('search/user_timeline result, ', result);
    res.send(result);
    /*var result = async(()=>{
      return await(twitterService.find(req.params[0], 'timeline', criteria));
    });
    result().then(result => {
      sails.log.debug('search/user_timeline result, ', result);
      res.send(result);
    });*/
    /*twitterService.find(req.params[0], 'timeline', criteria, (err, result)=> {
      if (err) {
        //noinspection TypeScriptUnresolvedVariable
        sails.log.error(err);
        res.send(err.statusCode);
      } else {
        sails.log.debug('search/user_timeline result, ', result);
        res.send(result);
      }
    });*/
  }

  tweets(req, res){
    var criteria = {
      where: {
        q: req.query.q || req.params.query,
        count: req.query.count || req.params.count
      }
    };
    sails.log.debug(criteria);

    /*twitterService.find(req.params[0], 'tweets', criteria, (err, result)=> {
      if (err) {
        sails.log.error(err);
        res.send(err.statusCode);
      } else {
        sails.log.debug('search/tweets result, ', result);
        res.send(result);
      }

    });*/
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

    /*twitterService.find(req.params[0], 'lookup', criteria, (err, result)=> {
      if (err) {
        sails.log.error(err);
        res.send(err.statusCode);
      } else {
        sails.log.debug('user/lookup result, ', result);
        res.send(result);
      }

    });*/
  }

}

module.exports = new TwitterController();
