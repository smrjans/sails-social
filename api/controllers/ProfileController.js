/**
 * ProfileController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */


global.loggedInProfile;
module.exports = {
    // Index page
    index : function (req, res) {


        return res.view({ 
        	user:global.loggedInProfile._json
        });
    }
};

