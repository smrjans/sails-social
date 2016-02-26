/**
 * AccountController
 *
 * @description :: Server-side logic for managing your account
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
//var User = require('User');
var User;
var AccountController = (function () {
    function AccountController() {
    }
    // Account main page
    AccountController.prototype.index = function (req, res) {
        console.log("+ ACCOUNT.INDEX");
        var accountLabel = "U"; // Empty User
        console.log(req.user);
        if (req.user) {
            if (req.user.firstname && req.user.lastname) {
                accountLabel = req.user.firstname[0];
                accountLabel += req.user.lastname[0];
            }
            else {
                if (req.user.name && req.user.name.length >= 2)
                    accountLabel = req.user.name.substring(0, 2).toUpperCase();
            }
        }
        User.find().exec(function (error, models) {
            var usersFound = models.length;
            var localUsers = 0;
            var fbUsers = 0;
            var twUsers = 0;
            models.forEach(function (model) {
                if (model.passports && model.passports.length) {
                    var passport = model.passports[model.passports.length - 1];
                    if (passport.provider == "local")
                        localUsers++;
                    else if (passport.provider == "facebook")
                        fbUsers++;
                    else if (passport.provider == "twitter")
                        twUsers++;
                }
            });
            return res.view({ accountLabel: accountLabel, usersFound: usersFound, localUsers: localUsers, fbUsers: fbUsers, twUsers: twUsers });
        });
    };
    return AccountController;
})();
exports.AccountController = AccountController;
module.exports = new AccountController();
