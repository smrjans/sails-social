import {Sails, Request, Response} from "sails";
/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

declare var sails: Sails;
export class HomeController{

    // Index page
    index(req: Request, res: Response) {

        console.log("+ HOME.INDEX");

        var enableLocalAuth = sails.config.authEnabled.local;
        var enableTwitterAuth = sails.config.authEnabled.twitter;
        var enableFacebookAuth = sails.config.authEnabled.facebook;

        var localAuthMsg, twitterAuthMsg, facebookAuthMsg;

        if (enableLocalAuth) localAuthMsg = "Configuration Ok";
        else localAuthMsg = "Disabled";

        if (enableTwitterAuth) twitterAuthMsg = "Configuration Ok";
        else twitterAuthMsg = "Disabled";

        if (enableFacebookAuth) facebookAuthMsg = "Configuration Ok";
        else facebookAuthMsg = "Disabled";

        return res.view({
            localAuthMsg: localAuthMsg,
            twitterAuthMsg: twitterAuthMsg,
            facebookAuthMsg: facebookAuthMsg
        });
    }
}

module.exports = new HomeController();

