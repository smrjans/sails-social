import {Sails, Model} from "sails";
import {Async} from "asyncawait";
import {Await} from "asyncawait";
import {Promise} from "asyncawait";
import {GoogleRequest} from "../models/GoogleRequest";

var _ = require('lodash');

var GoogleAPICustomSearch = require('machinepack-googleapicustomsearch');
//var sails = require('sails');
var async: Async = require('asyncawait/async');
var await: Await = require('asyncawait/await');

declare var sails: Sails;
declare var User: Model;
declare var Q;
//var User = sails.models.user;
var apiKey = sails.config.passport.twitter.options.consumerKey;
var apiSecret = sails.config.passport.twitter.options.consumerSecret;
var accessToken = sails.config.connections.twitter.consumerSecret;
var accessTokenSecret = sails.config.connections.twitter.consumerSecret;

export class GoogleService{
  search(request: GoogleRequest){
    //return async(()=>{
    console.log("+ GOOGLE.SEARCH");
      var deferred = Promise.defer();
      GoogleAPICustomSearch.search(request).exec({
        error: e =>{
          deferred.reject(e);
        },
        invalidParameter: e =>{
          deferred.reject(e);
        },
        dailyLimitExceededUnreg: e =>{
          deferred.reject(e);
        },
        // OK.
        success: result => {
          deferred.resolve(result);
        }
      });
      return deferred.promise;
    //})();
  }

  // An unexpected error occurred.
  error(request){

  }

  // Invalid field parameter passed
  invalidParameter(request){

  }

  // Daily Limit for Unauthenticated Use Exceeded. Continued use requires signup.
  dailyLimitExceededUnreg(request){

  }

}

module.exports = new GoogleService();
