/**
 * Twitter.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var sails;
(function (sails) {
    var models;
    (function (models) {
        var Test = (function () {
            function Test() {
            }
            return Test;
        })();
        models.Test = Test;
        module.exports = new Test();
    })(models = sails.models || (sails.models = {}));
})(sails = exports.sails || (exports.sails = {}));
