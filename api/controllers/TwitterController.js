"use strict";
/**
 * TwitterController
 *
 * @description :: Server-side logic for managing twitters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var twitterService = require("../services/TwitterService");
var TwitterController = (function () {
    function TwitterController() {
    }
    TwitterController.prototype.timeline = function (req, res) {
        //Use the Waterline syntax
        var criteria = {
            where: req.query
        };
        if (!criteria.where.screen_name) {
            criteria.where.screen_name = 'D_Asterra';
        }
        twitterService.find(req.params[0], 'timeline', criteria, function (err, result) {
            if (err) {
                sails.log.error(err);
                res.send(err.statusCode);
            }
            else {
                sails.log.debug('search/user_timeline result, ', result);
                res.send(result);
            }
        });
    };
    TwitterController.prototype.search = function (req, res) {
        var criteria = {
            where: {
                q: req.query.q || req.params.query,
                count: req.query.count || req.params.count
            }
        };
        sails.log.debug(criteria);
        twitterService.find(req.params[0], 'tweet', criteria, function (err, result) {
            if (err) {
                sails.log.error(err);
                res.send(err.statusCode);
            }
            else {
                sails.log.debug('search/tweets result, ', result);
                res.send(result);
            }
        });
    };
    TwitterController.prototype.lookup = function (req, res) {
        var criteria = {
            where: req.query
        };
        if (!criteria.where.screen_name) {
            criteria.where.screen_name = 'D_Asterra';
        }
        sails.log.debug(criteria);
        twitterService.find(req.params[0], 'lookup', criteria, function (err, result) {
            if (err) {
                sails.log.error(err);
                res.send(err.statusCode);
            }
            else {
                sails.log.debug('user/lookup result, ', result);
                res.send(result);
            }
        });
    };
    TwitterController.prototype.rest = function (req, res) {
        var criteria = {
            where: req.query
        };
        if (!criteria.where.screen_name) {
            criteria.where.screen_name = 'D_Asterra';
        }
        sails.log.debug(criteria);
        sails.log.debug('username: ' + req.params[0]);
        sails.log.debug('api: ' + req.query.api);
        twitterService.find(req.params[0], req.query.api, criteria, function (err, result) {
            if (err) {
                sails.log.error(err);
                res.send(err.statusCode);
            }
            else {
                sails.log.debug(req.params[1] + ' result, ', result);
                res.send(result);
            }
        });
    };
    return TwitterController;
}());
exports.TwitterController = TwitterController;
module.exports = new TwitterController();
