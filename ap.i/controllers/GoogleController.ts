import {Request} from "sails";
import {Response} from "sails";
import {Sails} from "sails";
import {Model} from "sails";
import {TwitterService} from "../services/TwitterService";
import {Async} from "asyncawait";
import {Await} from "asyncawait";
import {GoogleService} from "../services/GoogleService";
import {GoogleRequest} from "../models/GoogleRequest";
var async: Async = require('asyncawait/async');
var await: Await = require('asyncawait/await');


var googleService: GoogleService = require("../services/GoogleService");
var Promise = require('bluebird');
var _ = require('lodash');

declare var global: Global;
declare var sails: Sails;
declare var Twitter: Model;

export class GoogleController {

  index(req: Request, res: Response) {

    console.log("+ GOOGLE.INDEX");
    var request = new GoogleRequest();
    request.q = 'smrutiranjan';
    request.cx = '003148667133413322073:ngcxn0jhixu';
    request.auth = 'AIzaSyAMyNztJY2Qmm3925eC4VQBuJBuLz5FoBk';
    request.exactTerms = 'smrutiranjan';
    request.siteSearch = 'linkedin.com';

    googleService.search(request).then(result=>{
      res.json(result);
    }).catch(e =>{
      res.json(e);
    });
  }

}

module.exports = new GoogleController();
