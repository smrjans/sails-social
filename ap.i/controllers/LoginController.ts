import {Sails} from "sails";
/**
 * AuthController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

declare var sails: Sails;
export class LoginController {

    // Login screen
    index(req, res) {
        var enableLocalAuth = sails.config.authEnabled.local;
        var enableTwitterAuth = sails.config.authEnabled.twitter;
        var enableFacebookAuth = sails.config.authEnabled.facebook;
        console.log("+ AUTH.LOGIN (empty credentials)");

        return res.view({
          enableLocalAuth: enableLocalAuth,
          enableTwitterAuth: enableTwitterAuth,
          enableFacebookAuth: enableFacebookAuth
        });
    }
}

module.exports = new LoginController();
